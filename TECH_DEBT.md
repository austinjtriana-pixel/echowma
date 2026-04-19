# Technical Debt

Running list of known issues and deferred work. Ordered roughly by priority
within each section. Update when items are fixed or new debt is introduced.

---

## Security (hardening, not ship-blocking)

- [ ] **Supabase key hygiene** — confirm `SUPABASE_KEY` is the `service_role`
      key (server-only) and that Row Level Security is enabled on the
      `submissions` table with no permissive policies. If the anon key is in
      use, rotate and lock down.
      → [netlify/functions/submit.js:7](netlify/functions/submit.js#L7)
- [x] **Subresource Integrity (SRI) on CDN scripts** — Sentry bundle now
      pinned with `integrity` hash. Google Fonts CSS endpoint omitted on
      purpose: it returns different `unicode-range` chunks per UA, so a
      static SRI hash would break the page intermittently (Google's own
      guidance). Revisit if we self-host the font CSS.
      → [index.html:7](index.html#L7)
- [ ] **Content-Security-Policy header** — no CSP is set. Add one via
      `netlify.toml` `[[headers]]` or a `_headers` file. Start in
      report-only mode, then enforce. Should allow self, Sentry, Supabase
      storage (for videos), and Google Fonts only.
- [ ] **Idempotency on submit** — no dedupe key. A retry or second tab
      could double-insert. Client generates a UUID per session; server
      enforces uniqueness in Supabase (`UNIQUE(submission_id)`).
      → [app.js:877](app.js#L877)
- [ ] **Rate limit is in-memory only** — resets per Lambda cold start and
      is per-container, so concurrent warm containers each get their own
      bucket. Fine for casual abuse; not a real defense. If abuse becomes
      real, move to a shared store (Supabase table with IP + timestamp, or
      Upstash/Redis).
      → [netlify/functions/submit.js:13](netlify/functions/submit.js#L13)
- [x] **Control-char stripping on rater fields** — CRLF in a name could
      render oddly in the admin's email client or downstream tools. Strip
      `[\x00-\x1F\x7F]` from `rater.name/hospital` before use.
      → [netlify/functions/submit.js](netlify/functions/submit.js)
- [ ] **Email domain allowlist** — validation accepts any well-formed
      email. If the study is Penn-only, pin to an allowlist of domains
      (`@pennmedicine.upenn.edu`, etc.).
      → [netlify/functions/submit.js:46](netlify/functions/submit.js#L46)
- [x] **Submit timeout on client** — `fetch` has no `AbortController`. If
      the function hangs, the user waits forever. Add ~30s timeout.
      → [app.js:886](app.js#L886)

## Performance

- [x] **Simultaneous video autoplay (up to 8/case)** — heaviest perf issue
      on mobile. Play only visible tiles via `IntersectionObserver`, or
      show a poster thumbnail and play on hover/click.
      → [app.js:617](app.js#L617)
- [x] **Full SVG re-render on every score click** — `cycleScore` →
      `renderAll()` rebuilds all 6 diagrams via `innerHTML`. Update only
      the changed path's `fill` and label `textContent`.
      → [app.js:404](app.js#L404), [app.js:419](app.js#L419)
- [x] **`saveState` on every comments keystroke** — full `JSON.stringify`
      + `localStorage.setItem` per keypress. Debounce to ~300ms.
      → [app.js:733](app.js#L733)
- [x] **Sentry init on every function invocation** — runs at module scope
      with an empty DSN fallback. Guard with
      `if (process.env.SENTRY_DSN) Sentry.init(...)`.
      → [netlify/functions/submit.js:4](netlify/functions/submit.js#L4)

## Code quality / maintainability

- [x] **No tests.** Server-side `validatePayload`, `csvCell`, and
      `stripCtrl` extracted to `netlify/functions/validate.js` and covered
      by 48 tests at [tests/validate.test.js](tests/validate.test.js)
      using Node's built-in test runner (no new deps). Run with `npm test`.
      Client-side `buildPayload` and WMSI calc still uncovered — would
      need jsdom or a refactor to extract from `app.js`.
- [ ] **Inline `onclick` handlers everywhere** — harder to reason about,
      blocked by a strict CSP. Migrate to `addEventListener` before turning
      CSP on.
      → [app.js](app.js), [index.html](index.html)
- [ ] **`CASE_VIDEOS` hardcoded in `app.js`** — adding/removing a case
      requires a code edit and redeploy. Move to a JSON config or a
      Supabase table.
      → [app.js:20](app.js#L20)
- [ ] **Magic numbers for diagram geometry** — `renderLongAxis` has
      dozens of inline constants for coordinates. Extract to named consts
      at the top of the function or a config block.
      → [app.js:227](app.js#L227)
- [x] **Schema-drift risk in Supabase insert** — columns `seg1..seg17` are
      written by hand ([submit.js:129-134](netlify/functions/submit.js#L129)).
      Build the row via a loop so adding/renaming segments is one change.
- [ ] **Error-handling strategy is inconsistent** — Supabase failure logs
      and continues; Resend failure returns 500. Decide: is a successful
      email or a successful DB insert the source of truth? Document it.
      → [netlify/functions/submit.js:150](netlify/functions/submit.js#L150)

## Infrastructure / ops

- [x] **No CI.** GitHub Action at [.github/workflows/ci.yml](.github/workflows/ci.yml)
      runs `npm test` on PRs and pushes to `main` (Node 20). Lint not
      added yet — no linter configured.
- [x] **`package.json` has no scripts** — `npm test` now wired up. Lint
      script still TBD when/if we add a linter.
      → [package.json](package.json)
- [x] **`node_modules/` is in git** (or at least not ignored explicitly
      via the package — it is in `.gitignore`, so confirm it's not
      actually tracked). Verified: `git ls-files | grep node_modules` is
      empty — nothing tracked.
- [x] **`netlify.toml` pins Node 18** while Netlify's default is moving
      to 20. Bump when convenient — we already have `typeof fetch` guards.
      → [netlify.toml:6](netlify.toml#L6)
- [ ] **No staging environment / deploy previews gate.** Main branch
      auto-deploys to prod. Consider protecting `main` and reviewing via
      deploy previews.

## Accessibility / UX

- [x] **Score picker is mouse-only** — right-click to open, keyboard only
      works once it's open. Add a keyboard path to open the picker (Enter
      on a focused segment).
      → [app.js:450](app.js#L450)
- [x] **SVG segments have no `role`/`aria-label`** — a screen reader can't
      announce "Basal Anterior, score 2". Add `role="button"` and
      `aria-label` per path.
      → [app.js:196](app.js#L196)
- [ ] **Color-only conveyance of score** — the number is shown in the
      segment too, which helps, but the legend relies on swatches. WCAG
      AA contrast (white-on-color) measured: Hyperkinesis 3.28, Normal
      3.60, Hypokinesis 4.40, Akinesis 4.49, Dyskinesis 3.45, Aneurysmal
      4.70. Only Aneurysmal and Not Assessed (gray-on-light) clear the
      4.5 threshold for normal text; the rest pass AA-large only. The
      on-segment digits are bold and ~16-18px so likely qualify as large
      text, but legend numerals do not. Either darken five swatch colors
      or pair color with a hatched/dotted pattern in the legend.
- [x] **`alert()` for submission failures** — replace with an inline
      error banner that doesn't steal focus.
      → [app.js:894](app.js#L894)

## Data / research

- [ ] **No schema migration for Supabase** — the `submissions` table
      definition lives only in the deployed DB. Check it into
      `supabase/migrations/` (or similar) so the schema is reproducible.
- [ ] **Analysis scripts read `dummy_data.csv` from CWD** — hardcoded
      path, no CLI arg. Fine for now; revisit if we start running these
      against real exports.
      → `analysis_*.R`
- [ ] **No ground-truth stored alongside submissions** — `analysis.R`
      and the dummy generator both encode truth in R. For real data we'll
      want a canonical ground-truth table.
