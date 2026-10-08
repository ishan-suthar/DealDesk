# Deal Desk — Progress & Milestones

## Milestones Summary

| Milestone | Title | Status |
|---|---|---|
| **M0** | Plan (no app code) | Done |
| **M1** | Foundation | Done |
| **M2** | Welcome, dashboard, discovery, quick preview, Recycle Bin | In Progress |
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
- Initialized Git repository and configured local user.
- Committed as `M0: Plan`.

### M1 — Foundation
- Scaffolded Next.js 14 App Router, TypeScript strict, Tailwind CSS, ESLint, Vitest, Playwright.
- Implemented all required npm scripts in `package.json`: `dev`, `typecheck`, `lint`, `test`, `test:e2e`, `build`, `db:migrate`, `db:seed`, `db:reset`.
- Implemented `src/domain`:
  - `enums.ts`: ValueStatus, SourceType, TransactionStatus, UserStatus, ClaimType, ValueType, JobStatus, DataOrigin, TimeWindow, GeographyRegion, status labels and descriptions.
  - `taxonomy.ts`: SECTORS and detailed subsectors for Consumer & Retail and 7 additional sectors.
  - `template.ts`: Governing deep report order from TEMPLATE_MAPPING (snapshot, companies, mechanics, rationale, sources) and field rule codes (S, C, A, D, M).
  - `schemas.ts`: Zod boundary schemas for all entities, filters, and API models.
  - `types.ts`: Inferred TypeScript types.
  - `userStatus.ts`: Pure state machine `transition(current, action, statusBeforeDelete)` and typed error `InvalidStatusTransitionError`.
- Implemented SQLite Drizzle schema and migrations:
  - Tables: `settings`, `companies`, `sources`, `deals`, `research_reports`, `notes`, `search_runs`, `jobs`.
  - Database client with WAL mode and foreign keys.
  - Automated migration runner `db:migrate`.
  - Database reset `db:reset` and fixture seeder `db:seed`.
- Created 10 fictional demo fixtures in `src/fixtures/demoDeals.ts` and `src/fixtures/demoReports.ts`:
  - All source URLs strictly under `https://example.com/demo/`.
  - Fictional companies only; relative dates anchored to seed time.
  - Fixture #1 (Harborline / Maple Crest) includes seeded deep report v1 and 3 notes.
  - Fixture #8 is on `review` hold; Fixture #9 is in Recycle Bin (`deleted`); Fixture #10 is >90 days old.
- Implemented unit-tested pure services in `src/server/services/`:
  - `normalizer.ts`: URL canonicalization (stripping tracking params, fragments, trailing slashes), source deduplication, company name normalization, deal `dedupeKey`, 10-day deduplication window.
  - `verification.ts`: `numberAppearsInText` (handles billions, millions, €, percentages, multiples), Rules 1–8 (provenance, fact support, number matching, status ceiling, conflict detection, date window, analysis reasoning).
  - `ranking.ts`: Code-based deal scoring (sector relevance 30%, recency 20%, significance 15%, primary evidence 15%, trend relevance 15%, novelty 5%) and top 2–3 reasons generation.
  - `calculations.ts`: EV/EBITDA, EV/Revenue multiples and premiums with status ceiling.
  - `sourceClassifier.ts`: Domain allowlist classification.
- Implemented repository layer in `src/server/repositories/`:
  - `settingsRepository.ts`, `companiesRepository.ts`, `sourcesRepository.ts`, `dealsRepository.ts`, `reportsRepository.ts`, `notesRepository.ts`, `searchRunsRepository.ts`, `jobsRepository.ts`.
- Created welcome screen (`/`) with exact UI copy: `Welcome {displayName}`, `Find a deal worth talking about.`, and `Start researching`.
- Unit tests: 72 tests across 6 suites in `tests/unit/`, including:
  - All valid and invalid state machine transitions.
  - Fixture URL domain enforcement test (`https://example.com/demo/`).
  - Normalization and deduplication.
  - Verification rules 1–8 and number matching.
  - Ranking scoring and reasons.
  - Calculations and status ceilings.
- Gate passed: `npm run typecheck && npm run lint && npm test && npm run build`.

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
7. **Next.js & React Versioning:**
   - Pinned Next.js to 14.2.35 and React to 18.3.1 to ensure seamless compatibility with `better-sqlite3`, Radix UI, and Drizzle ORM.

---

## Deferred

- PDF Export (explicitly out of scope for v1 in PRODUCT_SPEC §1 and §3.6; DOCX and Markdown are supported).
- Multi-user authentication & cloud sync (v1 is single-user, local-first on 127.0.0.1).
- Live market-data feeds (prices, market cap, EV are sourced only from filings/articles with `asOf`).

---

## Known issues

- None at M1.

---

## Dependencies added

- `next@14.2.35`, `react@18.3.1`, `react-dom@18.3.1`: App Router framework.
- `better-sqlite3@13.0.3`, `drizzle-orm@0.45.3`, `drizzle-kit@0.31.11`: Local-first SQLite database and ORM migrations.
- `zod@4.6.5`: Type-safe schema boundaries.
- `tailwindcss@3.4.17`, `postcss@8.5.29`, `autoprefixer@10.6.1`, `clsx`, `tailwind-merge`: Styling.
- `@radix-ui/react-*` primitives: Accessible UI components (dialog, dropdown-menu, select, tabs, toast, slot).
- `lucide-react`: UI iconography.
- `docx@9.9.0`, `react-markdown@10.1.0`: DOCX export and sanitized markdown rendering.
- `@anthropic-ai/sdk`, `@google/genai`, `zod-to-json-schema`: Server-only LLM SDKs and tool schema generation.
- `vitest@2.1.8`, `@playwright/test`: Unit and E2E test runners.
- `tsx`: TypeScript execution for migrations and seed scripts.
