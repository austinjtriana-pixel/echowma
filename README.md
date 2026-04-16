# EchoWMA — Wall Motion Scoring Survey

A web-based survey tool for inter-rater reliability studies in echocardiographic wall motion scoring. Raters score 17 cardiac segments (AHA 17-segment model) across 5 cases on a 0–5 scale.

## Architecture

- **Frontend:** Static HTML/CSS/JavaScript (no build process)
- **Backend:** Netlify Functions (Node.js serverless)
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend API (CSV attachment per submission)
- **Analysis:** R script for inter-rater reliability statistics
- **Hosting:** Netlify

## Scoring Scale

| Score | Label        | Color   |
|-------|-------------|---------|
| N/A   | Not Assessed | Gray    |
| 0     | Hyperkinesis | Green   |
| 1     | Normal       | Blue    |
| 2     | Hypokinesis  | Purple  |
| 3     | Akinesis     | Red     |
| 4     | Dyskinesis   | Orange  |
| 5     | Aneurysmal   | Brown   |

## Supabase Schema

The `submissions` table stores one row per case per rater:

```sql
CREATE TABLE submissions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rater_name  TEXT NOT NULL,
  rater_email TEXT,
  hospital    TEXT,
  role        TEXT,
  case_number INTEGER NOT NULL,
  seg1        INTEGER,  -- Basal Anterior (0-5, NULL = not assessed)
  seg2        INTEGER,  -- Basal Anteroseptal
  seg3        INTEGER,  -- Basal Inferoseptal
  seg4        INTEGER,  -- Basal Inferior
  seg5        INTEGER,  -- Basal Inferolateral
  seg6        INTEGER,  -- Basal Anterolateral
  seg7        INTEGER,  -- Mid Anterior
  seg8        INTEGER,  -- Mid Anteroseptal
  seg9        INTEGER,  -- Mid Inferoseptal
  seg10       INTEGER,  -- Mid Inferior
  seg11       INTEGER,  -- Mid Inferolateral
  seg12       INTEGER,  -- Mid Anterolateral
  seg13       INTEGER,  -- Apical Anterior
  seg14       INTEGER,  -- Apical Septal
  seg15       INTEGER,  -- Apical Inferior
  seg16       INTEGER,  -- Apical Lateral
  seg17       INTEGER,  -- Apex
  wmsi        NUMERIC,
  comments    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

Set these in the Netlify UI (Site settings > Environment variables):

| Variable        | Required | Description                          |
|----------------|----------|--------------------------------------|
| `RESEND_API_KEY` | Yes      | API key for Resend email service     |
| `SUPABASE_URL`   | Yes      | Supabase project REST API URL        |
| `SUPABASE_KEY`   | Yes      | Supabase anon/service role key       |
| `TO_EMAIL`       | No       | Recipient email for submissions      |
| `SENTRY_DSN`     | No       | Sentry DSN for error tracking        |

## Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run local dev server (serves static files + functions)
netlify dev
```

The site will be available at `http://localhost:8888`.

## Analysis (R)

The `analysis.R` script computes inter-rater reliability statistics:

- Fleiss' Kappa (multi-rater agreement)
- Intraclass Correlation Coefficient (ICC)
- Weighted Cohen's Kappa (pairwise)

**Dependencies:** `tidyverse`, `irr`

```r
install.packages(c("tidyverse", "irr"))
source("analysis.R")
```
