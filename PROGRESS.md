# Deal Desk — Progress & Milestones

## Milestones Summary

| Milestone | Title | Status |
|---|---|---|
| **M0** | Plan (no app code) | Done |
| **M1** | Foundation | In Progress |
| **M2** | Welcome, dashboard, discovery, quick preview, Recycle Bin | Not Started |
| **M3** | Deep research report | Not Started |
| **M4** | Notebook and export | Not Started |
| **M5** | Live providers (contract tests, recorded responses) | Not Started |
| **M6** | Hardening and handoff | Not Started |

---

## Done

### M0 — Plan
- Created `PLAN.md` with:
  - Complete project file tree aligned with AGENTS.md and DATA_AND_RESEARCH.
  - Drizzle SQLite tables mapping every entity from `docs/DATA_AND_RESEARCH.md` §3 (settings, companies, sources, deals, research_reports, notes, search_runs, jobs).
  - API routes with HTTP methods, paths, Zod input validation schemas, response formats, and error codes (400, 404, 409).
  - Architecture for in-process job runner, heartbeat tracking, client polling interval (1s), and fallback provider selection.
  - Test mapping linking Acceptance Criteria AC1 through AC10 to specific unit, component, and E2E test files.
- Initialized Git repository and set local config.

---

## Decisions

1. **Database Schema & SQLite JSON Columns:**
   - Entities with rich nested structures (`FactValue`, `QuickPreview`, `ranking`, `ReportSection[]`, `SearchFilters`, tags/arrays) are mapped to SQLite `text` columns using Drizzle's `{ mode: 'json' }`.
   - Zod schemas in `src/domain/schemas.ts` parse and validate data at the repository and API boundaries.
2. **Provider Selection and Fallback:**
   - `RESEARCH_PROVIDER` defaults to `demo`.
   - If `anthropic` or `gemini` is requested without corresponding environment variables (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`), the server logs a notice and seamlessly falls back to `demo` provider, displaying the required UI alert: `"Live research isn't configured. Running in demo mode."`.
3. **Google Grounding Terms Review (Gemini):**
   - Google Search Grounding terms require displaying grounding attributions/search suggestions. The UI includes source provenance links for all claims. Caching and export are permitted for internal research review briefs.
4. **Dates & Clock Injection:**
   - All relative dates (seed fixtures, search windows, report relative times) compute from the server-provided `ctx.today` or current server date, never relying on LLM internal assumptions.
5. **State Machine Conflicts & Purge:**
   - Any invalid transition according to `userStatus.ts` yields an HTTP 409 Conflict.
   - Permanent removal (`purge`) is only permitted on deals currently in `deleted` status, and triggers deletion of associated notes and research report versions.
6. **Fixture Isolation:**
   - All fixtures use fictional companies with URLs strictly under `https://example.com/demo/`. Tested via unit tests to guarantee zero real company leakage.

---

## Deferred

- PDF Export (explicitly out of scope for v1 in PRODUCT_SPEC §1 and §3.6; DOCX and Markdown are supported).
- Multi-user authentication & cloud sync (v1 is single-user, local-first on 127.0.0.1).
- Live market-data feeds (prices, market cap, EV are sourced only from filings/articles with `asOf`).

---

## Known issues

- None at M0.

---

## Dependencies added

*(None yet for M0)*
