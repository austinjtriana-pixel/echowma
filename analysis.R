# ============================================================
# EchoWMA Inter-Rater Reliability Analysis
# ============================================================
# This script computes inter-rater reliability statistics
# from CSV files exported by the EchoWMA scoring tool.
#
# Required packages: irr, tidyverse
# Install with: install.packages(c("irr", "tidyverse"))
# ============================================================

library(tidyverse)
library(irr)

# ------------------------------------------------------------
# 1. LOAD AND COMBINE ALL RATER CSV FILES
# ------------------------------------------------------------
# Place all exported CSV files in one folder and set the path:
csv_folder <- "exports"  # <-- change to your folder path

csv_files <- list.files(csv_folder, pattern = "\\.csv$", full.names = TRUE)
cat("Found", length(csv_files), "CSV files:\n")
print(basename(csv_files))

# Read and combine
all_data <- map_dfr(csv_files, read_csv, show_col_types = FALSE)

cat("\nRaters:", paste(unique(all_data$RaterID), collapse = ", "), "\n")
cat("Cases per rater:\n")
print(table(all_data$RaterID))

# Display role breakdown if column exists
if ("Role" %in% names(all_data)) {
  cat("\nRole breakdown:\n")
  print(table(all_data$RaterID, all_data$Role))
}

# Segment columns
seg_cols <- paste0("Seg", 1:17, "_",
  c("BasalAnterior", "BasalAnteroseptal", "BasalInferoseptal",
    "BasalInferior", "BasalInferolateral", "BasalAnterolateral",
    "MidAnterior", "MidAnteroseptal", "MidInferoseptal",
    "MidInferior", "MidInferolateral", "MidAnterolateral",
    "ApicalAnterior", "ApicalSeptal", "ApicalInferior",
    "ApicalLateral", "Apex"))

# ------------------------------------------------------------
# 2. FLEISS' KAPPA (per case, all segments pooled)
# ------------------------------------------------------------
# Fleiss' kappa measures agreement among multiple raters
# for categorical ratings.

cat("\n============================================================\n")
cat("FLEISS' KAPPA — Per Case (all 17 segments pooled)\n")
cat("============================================================\n")

for (case_num in 1:5) {
  case_data <- all_data %>% filter(CaseNumber == case_num)
  n_raters <- nrow(case_data)

  if (n_raters < 2) {
    cat(sprintf("Case %d: Skipped (only %d rater)\n", case_num, n_raters))
    next
  }

  # Build matrix: rows = segments (17), columns = raters
  # Each cell = the score assigned by that rater to that segment
  ratings_matrix <- case_data %>%
    select(all_of(seg_cols)) %>%
    t()  # transpose: rows=segments, cols=raters

  # Fleiss' kappa expects: rows = subjects, cols = raters
  # Each cell = rating assigned
  result <- tryCatch(
    kappam.fleiss(ratings_matrix),
    error = function(e) NULL
  )

  if (!is.null(result)) {
    cat(sprintf("Case %d: Fleiss' kappa = %.3f (z = %.2f, p = %.4f)\n",
                case_num, result$value, result$statistic, result$p.value))
  } else {
    cat(sprintf("Case %d: Could not compute (check for missing data)\n", case_num))
  }
}

# ------------------------------------------------------------
# 3. FLEISS' KAPPA — Per Segment (across all cases)
# ------------------------------------------------------------
cat("\n============================================================\n")
cat("FLEISS' KAPPA — Per Segment (pooled across cases)\n")
cat("============================================================\n")

seg_names <- c("Basal Anterior", "Basal Anteroseptal", "Basal Inferoseptal",
               "Basal Inferior", "Basal Inferolateral", "Basal Anterolateral",
               "Mid Anterior", "Mid Anteroseptal", "Mid Inferoseptal",
               "Mid Inferior", "Mid Inferolateral", "Mid Anterolateral",
               "Apical Anterior", "Apical Septal", "Apical Inferior",
               "Apical Lateral", "Apex")

segment_kappas <- tibble(Segment = integer(), Name = character(),
                         Kappa = numeric(), z = numeric(), p = numeric())

for (seg_idx in 1:17) {
  col <- seg_cols[seg_idx]

  # For each case, extract this segment's scores from all raters
  # Build matrix: rows = case-instances, cols = raters
  rater_ids <- unique(all_data$RaterID)
  n_raters <- length(rater_ids)

  if (n_raters < 2) next

  seg_matrix <- matrix(NA, nrow = 5, ncol = n_raters)
  for (r in seq_along(rater_ids)) {
    rater_data <- all_data %>% filter(RaterID == rater_ids[r]) %>% arrange(CaseNumber)
    seg_matrix[, r] <- rater_data[[col]]
  }

  result <- tryCatch(
    kappam.fleiss(seg_matrix),
    error = function(e) NULL
  )

  if (!is.null(result)) {
    segment_kappas <- bind_rows(segment_kappas, tibble(
      Segment = seg_idx, Name = seg_names[seg_idx],
      Kappa = result$value, z = result$statistic, p = result$p.value
    ))
  }
}

print(segment_kappas, n = 17)

# ------------------------------------------------------------
# 4. WEIGHTED KAPPA (pairwise, for ordinal scale)
# ------------------------------------------------------------
# Cohen's weighted kappa accounts for the ordinal nature of
# the scoring scale (near-misses penalized less than far-misses).

cat("\n============================================================\n")
cat("WEIGHTED KAPPA — Pairwise (all segments, all cases)\n")
cat("============================================================\n")

rater_ids <- unique(all_data$RaterID)
n_raters <- length(rater_ids)

if (n_raters >= 2) {
  pairwise_kappas <- tibble(Rater1 = character(), Rater2 = character(),
                            WeightedKappa = numeric(), Unweighted = numeric())

  for (i in 1:(n_raters - 1)) {
    for (j in (i + 1):n_raters) {
      r1_data <- all_data %>%
        filter(RaterID == rater_ids[i]) %>%
        arrange(CaseNumber) %>%
        select(all_of(seg_cols)) %>%
        unlist()

      r2_data <- all_data %>%
        filter(RaterID == rater_ids[j]) %>%
        arrange(CaseNumber) %>%
        select(all_of(seg_cols)) %>%
        unlist()

      # Remove pairs where either is NA
      valid <- !is.na(r1_data) & !is.na(r2_data)

      if (sum(valid) > 1) {
        wk <- tryCatch(
          kappa2(cbind(r1_data[valid], r2_data[valid]), weight = "squared"),
          error = function(e) NULL
        )
        uk <- tryCatch(
          kappa2(cbind(r1_data[valid], r2_data[valid]), weight = "unweighted"),
          error = function(e) NULL
        )

        pairwise_kappas <- bind_rows(pairwise_kappas, tibble(
          Rater1 = rater_ids[i], Rater2 = rater_ids[j],
          WeightedKappa = if (!is.null(wk)) wk$value else NA,
          Unweighted = if (!is.null(uk)) uk$value else NA
        ))
      }
    }
  }

  print(pairwise_kappas)
  cat(sprintf("\nMean weighted kappa: %.3f\n", mean(pairwise_kappas$WeightedKappa, na.rm = TRUE)))
  cat(sprintf("Mean unweighted kappa: %.3f\n", mean(pairwise_kappas$Unweighted, na.rm = TRUE)))
} else {
  cat("Need at least 2 raters for pairwise kappa.\n")
}

# ------------------------------------------------------------
# 5. ICC (Intraclass Correlation Coefficient)
# ------------------------------------------------------------
# ICC treats scores as continuous/ordinal and measures consistency.
# ICC(2,1) = two-way random, single measures — appropriate when
# all raters score all cases.

cat("\n============================================================\n")
cat("ICC — Per Case\n")
cat("============================================================\n")

for (case_num in 1:5) {
  case_data <- all_data %>% filter(CaseNumber == case_num)
  n_raters <- nrow(case_data)

  if (n_raters < 2) next

  ratings_matrix <- case_data %>%
    select(all_of(seg_cols)) %>%
    t()  # rows=segments, cols=raters

  result <- tryCatch(
    icc(ratings_matrix, model = "twoway", type = "agreement", unit = "single"),
    error = function(e) NULL
  )

  if (!is.null(result)) {
    cat(sprintf("Case %d: ICC(2,1) = %.3f [95%% CI: %.3f - %.3f], F = %.2f, p = %.4f\n",
                case_num, result$value, result$lbound, result$ubound,
                result$Fvalue, result$p.value))
  }
}

# Overall ICC across all cases
cat("\nOverall ICC (all cases pooled):\n")
rater_ids <- unique(all_data$RaterID)
if (length(rater_ids) >= 2) {
  # Build big matrix: rows = all segment-case combos (17*5=85), cols = raters
  big_matrix <- matrix(NA, nrow = 85, ncol = length(rater_ids))
  for (r in seq_along(rater_ids)) {
    rater_data <- all_data %>%
      filter(RaterID == rater_ids[r]) %>%
      arrange(CaseNumber) %>%
      select(all_of(seg_cols)) %>%
      unlist()
    big_matrix[, r] <- rater_data
  }

  result <- tryCatch(
    icc(big_matrix, model = "twoway", type = "agreement", unit = "single"),
    error = function(e) NULL
  )

  if (!is.null(result)) {
    cat(sprintf("ICC(2,1) = %.3f [95%% CI: %.3f - %.3f], F = %.2f, p = %.4f\n",
                result$value, result$lbound, result$ubound,
                result$Fvalue, result$p.value))
  }
}

# ------------------------------------------------------------
# 6. WMSI AGREEMENT
# ------------------------------------------------------------
cat("\n============================================================\n")
cat("WMSI COMPARISON\n")
cat("============================================================\n")

wmsi_table <- all_data %>%
  select(RaterID, CaseNumber, WMSI) %>%
  pivot_wider(names_from = RaterID, values_from = WMSI)

print(wmsi_table)

# ICC for WMSI
if (length(rater_ids) >= 2) {
  wmsi_matrix <- all_data %>%
    select(RaterID, CaseNumber, WMSI) %>%
    pivot_wider(names_from = RaterID, values_from = WMSI) %>%
    select(-CaseNumber) %>%
    as.matrix()

  result <- tryCatch(
    icc(wmsi_matrix, model = "twoway", type = "agreement", unit = "single"),
    error = function(e) NULL
  )

  if (!is.null(result)) {
    cat(sprintf("\nWMSI ICC(2,1) = %.3f [95%% CI: %.3f - %.3f]\n",
                result$value, result$lbound, result$ubound))
  }
}

# ------------------------------------------------------------
# 7. INTERPRETATION GUIDE
# ------------------------------------------------------------
cat("\n============================================================\n")
cat("INTERPRETATION GUIDE\n")
cat("============================================================\n")
cat("Kappa / ICC interpretation (Landis & Koch, 1977):\n")
cat("  < 0.00  Poor\n")
cat("  0.00 - 0.20  Slight\n")
cat("  0.21 - 0.40  Fair\n")
cat("  0.41 - 0.60  Moderate\n")
cat("  0.61 - 0.80  Substantial\n")
cat("  0.81 - 1.00  Almost perfect\n")
cat("\nWeighted kappa is preferred for ordinal scales like WMA scoring\n")
cat("as it accounts for the magnitude of disagreement.\n")
