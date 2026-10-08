# Deal Desk — Progress & Milestones

## Milestones Summary

| Milestone | Title | Status |
|---|---|---|
| **M0** | Plan (no app code) | Done |
| **M1** | Foundation | Done |
| **M2** | Welcome, dashboard, discovery, quick preview, Recycle Bin | Done |
| **M3** | Deep research report | Done |
| **M4** | Notebook and export | Done |
| **M5** | Live providers (contract tests, recorded responses) | Done |
| **M6** | Hardening and handoff | Done |

---

## Done

### M0 — Plan
- Created `PLAN.md` with file tree, Drizzle tables, API route definitions, job runner architecture, and AC1–AC10 test mappings.
- Initialized Git repository and set local config.
- Committed as `M0: Plan`.

### M1 — Foundation
- Scaffolded Next.js 14 App Router, TypeScript strict, Tailwind CSS, ESLint, Vitest, Playwright.
- Implemented all required npm scripts: `dev`, `typecheck`, `lint`, `test`, `test:e2e`, `build`, `db:migrate`, `db:seed`, `db:reset`.
- Implemented `src/domain` enums, schemas, types, taxonomy, template definition, and `userStatus.ts` state machine.
- Implemented SQLite Drizzle schema, migrations, and repository layer.
- Populated 10 fictional demo fixtures with URLs strictly under `https://example.com/demo/`.
- Implemented pure services: `normalizer.ts`, `verification.ts` (rules 1–8 and `numberAppearsInText`), `ranking.ts`, `calculations.ts`, `sourceClassifier.ts`.
- Created welcome screen (`/`) with exact copy.
- 72 unit tests passing in `tests/unit/`.
- Committed as `M1: Foundation`.

### M2 — Welcome, dashboard, discovery, quick preview, Recycle Bin
- Built research dashboard (`/research`):
  - Three-column layout (1280px wide) transitioning to tabs (`My Deals`, `Results`, `Workspace`) below 1024px.
  - Left rail with searchable saved-deal study list, transaction status chips, and "researched recently" hints.
  - Top search controls: Sector, Subsectors (multi-select), Time window, Max deals (5, 10, 15, 25), Deal status, Include rumored checkbox, Geography.
  - Active filter chips and summary line with exact copy.
  - Progress stages showing in exact order: `Finding candidates` -> `Checking primary sources` -> `Extracting deal facts` -> `Ranking for interview usefulness`.
  - Incremental cards showing transaction status chips, evidence badges (`Primary source` / `Secondary only`), and top 2–3 ranking reasons.
  - Center queue groups: **On hold**, **Restored**, and **Current results**, plus `Collapse results` / `Show results` toggle.
  - "N hidden in Recycle Bin" note.
- Built Quick Preview panel:
  - Screening brief displaying headline, summary, background, parties and roles (PE sponsors marked), advisers (financial & legal separate; `Not yet found` when empty), deal value via `FactValue`, multiples, differentiators (`Analysis — not investment advice`), drivers, and sources.
  - Footer with exact 3 buttons in order: `Save to My Deals` · `Hold for review` (or `Remove hold`) · `I don't like this deal` (or "Saved to My Deals" and `Open research` if saved).
- Built Recycle Bin (`/recycle-bin`):
  - Lists deleted deals with deletion date, prior status, original filter chips.
  - Exact action buttons: `Restore` and `Permanently remove`.
  - Permanent remove modal dialog confirming destruction of notes and report versions.
- Built Settings (`/settings`):
  - Editable display name, read-only research mode (`Demo` or `Live — {provider}`), and `Reset demo data` with confirmation modal dialog.
- Built Toast system with 8-second undo toasts for `I don't like this deal` and success toast for `Save to My Deals`.
- Built Job Runner singleton with 5s heartbeat, interruption recovery, and 1s client polling.
- Implemented `failing_test` provider and verified all 8 system states from PRODUCT_SPEC §3.8.
- Persistent `Demo data` banner displayed across the application in demo mode.
- E2E test suite passing with Playwright:
  - AC1: Welcome page flow (`tests/e2e/ac1_welcome.spec.ts`)
  - AC2: Discovery run in demo mode (`tests/e2e/ac2_discovery.spec.ts`)
  - AC3: Quick preview fields & 3 footer buttons (`tests/e2e/ac3_quick_preview.spec.ts`)
  - AC4: Save to My Deals & left rail persistence (`tests/e2e/ac4_save_deal.spec.ts`)
  - AC7: Recycle bin restore flow (`tests/e2e/ac7_recycle_bin.spec.ts`)
- Full milestone gate passed: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`.

### M3 — Deep research report
- Implemented Section-by-Section Deep Research Pipeline (`src/server/services/deepPipeline.ts`):
  - Emits section progress updates: Deal Snapshot, Company Overview, Deal Summary & Mechanics, Rationale & Judgment, Sources & Research Gaps.
  - Generates immutable report versions (`version 1, 2, ...`) preserving historical versions.
- Implemented Reports API routes:
  - `GET /api/deals/[id]/reports`: Returns all report versions for a deal.
  - `POST /api/deals/[id]/reports`: Triggers new deep research job with concurrency check (rejects if already running).
  - `GET /api/deals/[id]/reports/[version]`: Returns specific historical report version.
- Implemented Deep Report UI (`src/components/report/DeepReportView.tsx`):
  - Template order matching `TEMPLATE_MAPPING.md` (Sections 1–5).
  - Report header (`ReportHeader.tsx`) with deal headline, transaction status, `Refresh research` button, version switcher dropdown, "Last researched {relative time}", and non-blocking refresh progress banner with Cancel button.
  - Section 1: Snapshot (`SnapshotSection.tsx`) with quick facts table and FactValue citations.
  - Section 2: Companies (`CompaniesSection.tsx`) with acquirer and target overviews, financial profiles, and products.
  - Section 3: Mechanics (`MechanicsSection.tsx`) with consideration structure, financing sources, regulatory status, and conditions.
  - Section 4: Rationale & Judgment (`RationaleSection.tsx`) with strategic rationale, risks, interview angles, and `Analysis — not investment advice` label.
  - Section 5: Sources & Research Gaps (`SourcesSection.tsx`) with source pack cards and research gaps callout.
  - Block action menu (`BlockActionMenu.tsx`) with keyboard navigation (`Tab`, `Space`, `Enter`).
  - Text selection listener preparing for note extraction.
- Automated tests:
  - `tests/unit/ac10_factValueIntegrity.test.ts`: AC10 FactValue component renders valueStatus, source citation chips, and handles missing/undisclosed states.
  - `tests/e2e/ac5_deep_report.spec.ts`: AC5 Deep research report, versioning and refresh flow passing.
- Full milestone gate passed: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`.

### M4 — Notebook and export
- Implemented Format-Neutral Export Document Service (`src/server/services/export/buildExportDocument.ts`):
  - Strictly follows template section order (Sections 1–4).
  - Consolidated render-state legend with exact labels for all 6 value statuses.
  - Numbered footnote indexing `[1]`, `[2]`, ... mapping claims and notes to external sources.
  - Groups notes by template section in template order, followed by "General notes", placing pinned notes first.
  - Accurately prints `Not publicly disclosed` or `Not available from reviewed sources` for missing or undisclosed fields; zero fabricated values.
  - Flags quotes originating from earlier report versions ("From an earlier report version").
- Implemented Exporters:
  - DOCX Exporter (`src/server/services/export/renderDocx.ts`): Uses `docx` to generate styled Word documents with tables, styled headings, notes, and bibliography.
  - Markdown Exporter (`src/server/services/export/renderMarkdown.ts`): Formats complete Markdown document with tables and footnotes.
- Implemented Export API (`src/app/api/export/[dealId]/route.ts`):
  - Supports `?format=docx` and `?format=markdown` with Content-Disposition attachment downloads.
  - Added Export dropdown with one-click download buttons to report header.
- Implemented Notes API Routes (`src/app/api/notes/`):
  - `GET /api/notes`: Lists notes with deal, section, and full-text search filters.
  - `POST /api/notes`: Creates note with strict 2,000-character quote limit enforcement.
  - `PATCH /api/notes/[id]`: Updates personal comments, pin status, or position.
  - `DELETE /api/notes/[id]`: Deletes note with support for client undo toast restoration.
  - `POST /api/notes/reorder`: Persists reordered note positions.
- Implemented Full Notebook View (`/notebook`):
  - Filter by deal and by template section.
  - Full-text search over quotes and personal comments.
  - Add manual notes with optional deal and section tags.
  - Inline editing, delete with 8-second undo toast, pin toggling.
  - Drag and keyboard reordering (`Move up` / `Move down`).
- Enhanced Deep Report View:
  - Multi-block selection handling with 2,000-char feedback.
  - Floating `Save to Notebook` button and accessible keyboard block action buttons.
- Automated Tests:
  - Unit test `tests/unit/exportDocument.test.ts` (AC8 export structure, legend, footnotes, note grouping).
  - E2E test `tests/e2e/ac6_notebook.spec.ts` (AC6 text selection, notebook search, persistence, and manual notes).
  - E2E test `tests/e2e/ac8_export.spec.ts` (AC8 non-empty DOCX and Markdown downloads).
- Full milestone gate passed: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build` (89 unit tests, 8 E2E tests).

### M5 — Live providers (contract tests, recorded responses)
- Implemented SEC EDGAR Client (`src/server/services/edgarClient.ts`):
  - Uses `SEC_USER_AGENT` header adhering to SEC fair access policy.
  - Enforces minimum ≥150 ms spacing between requests (< 10 requests/second limit).
  - Handles retries with exponential backoff on 429/5xx and network faults.
  - Connects to SEC full-text search API (`efts.sec.gov`) and marks all retrieved filings as `primary` sources.
- Implemented Versioned Extraction Prompts (`src/server/providers/prompts/`):
  - `v1_discovery.ts` (`v1.0.0`): strictly injects `ctx.today`, explicit time windows, untrusted content warnings, and source ID provenance constraints.
  - `v1_deep_section.ts` (`v1.0.0`): section-by-section extraction prompts with data integrity directives and open questions compilation.
- Implemented Anthropic Provider Adapter (`src/server/providers/anthropic/`):
  - Messages API integration with `web_search` and `web_fetch` server tools (`config.ts`).
  - Captures evidence items from `tool_result` blocks for audit trail and provenance.
  - Gracefully handles `error_code` blocks as warnings, supports turn continuation, and extracts via forced `submit_result` tool call.
- Implemented Gemini Provider Adapter (`src/server/providers/gemini/`):
  - Integrates `@google/genai` with Google Search grounding tool (`tools: [{ googleSearch: {} }]`).
  - Gathers evidence items from `groundingMetadata` chunks and supports.
  - Resolves redirect URIs server-side to canonical destination URLs before registering in the source pack.
  - Extracts structured data using response JSON schema.
- Implemented Budget Management (`src/server/jobs/budgetManager.ts`):
  - Tracks `DAILY_SEARCH_CAP` (default 300) with automatic daily reset.
  - Enforces per-job search and fetch limits (Discovery: 20 searches / 15 fetches; Deep Research: 30 searches / 25 fetches).
- Implemented Smoke Script (`npm run live:smoke`):
  - Validates SEC EDGAR connectivity and provider fallback when keys are absent.
  - Exits with a clear, readable message guiding user how to configure API keys.
- Automated Contract Tests (`tests/unit/providerContracts.test.ts`):
  - 7 unit tests verifying Anthropic, Gemini, and EDGAR against recorded response fixtures with zero network requests.
  - Verified that missing keys gracefully fall back to demo mode.
- Full milestone gate passed: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build` (96 unit tests, 8 E2E tests).
- Committed as `M5: Live providers`.

### M6 — Hardening and handoff
- Accessibility & keyboard navigation pass:
  - Ensured semantic headings (`h1` on Welcome and Notebook, `h2` on Left Rail and Quick Preview, `h3` on Deal Cards, `h4` on Preview subheadings).
  - Associated form labels in `SearchControls.tsx` with explicit `htmlFor` and `id` attributes.
  - Enabled keyboard focusability (`tabIndex={0}`, Enter/Space handlers) on discovery deal cards and `BlockActionMenu` buttons (`focus-within:opacity-100`).
  - Implemented `tests/e2e/accessibility_keyboard.spec.ts` testing semantic headings/labels and full keyboard workflow: Search -> Preview -> Save to My Deals -> Deep Report -> Notebook.
- Responsive design verification:
  - Verified layout across desktop (1280px), tablet (1024px), and mobile (768px).
  - Implemented `tests/e2e/responsive.spec.ts` testing 3-column desktop layout and tablet/mobile tab switching (`My Deals`, `Results`, `Workspace`) with automatic tab activation upon deal selection.
- Security audit pass per `AGENTS.md`:
  - Implemented `tests/unit/security.test.ts` statically verifying:
    1. Zero client-side imports of server-only LLM SDKs (`@anthropic-ai/sdk`, `@google/genai`).
    2. Zero instances of `dangerouslySetInnerHTML` across all `src/` files.
    3. Zero hardcoded API keys or secrets in repository code or `.env.example`.
    4. Dev server binds strictly to `127.0.0.1`.
- Comprehensive `README.md`:
  - Detailed documentation covering architecture, setup, demo mode operation, live provider configuration, SEC EDGAR compliance, test commands, privacy and data limits, and "Analysis — not investment advice" notice.
- Full milestone gate passed:
  - `npm run typecheck` passed (0 errors).
  - `npm run lint` passed (0 warnings or errors).
  - `npm test` passed (100/100 tests in 11 test files).
  - `npm run test:e2e` passed (13/13 Playwright test suites).
  - `npm run build` passed (12/12 static/dynamic routes compiled).

---

## Decisions

1. **Google Grounding Terms Review:**
   - Reviewed Google Search grounding terms: Display requirements require maintaining publisher titles and domain names for grounded sources, which Deal Desk preserves in its source packs and citations. Redirect links from search grounding are resolved server-side to their canonical target URLs.
2. **Format-Neutral Export Model:**
   - Modeled `ExportDocument` as an intermediate abstraction before rendering to DOCX and Markdown, ensuring both formats share identical section ordering, footnote numbering, and legend definitions.
3. **2,000-Character Selection Guard:**
   - Enforced 2,000-character limit both client-side (UI badge/notification) and server-side (Zod schema rejection) per PRODUCT_SPEC §3.6.
4. **Deep Report Versioning:**
   - Reports are stored immutably with auto-incrementing `version` numbers per deal.
   - Refreshes run asynchronously via `deepPipeline`, letting the user browse and read prior report versions while a refresh runs in the background.
5. **FactValue Strict Rendering:**
   - Enforced value status visibility (`confirmed`, `derived`, `unverified`, `not_disclosed`, `not_available`) directly in DOM structure to satisfy AC10.
6. **Discovery Queue Persistence:**
   - Queue groups (On hold, Restored, Current results) are calculated dynamically on the server from the latest search run and deals database.
7. **Dynamic Route Rendering:**
   - Explicitly configured `export const dynamic = 'force-dynamic'` on `/api/search/current` to ensure freshest SQLite state is returned upon every client poll.
8. **Responsive Tab Switcher:**
   - Under 1024px, the 3 desktop columns collapse into mobile tabs (`My Deals`, `Results`, `Workspace`), automatically focusing on `Workspace` when a user clicks a deal card.
9. **Permanent Removal Guard:**
   - Purge permanently checks `deal.userStatus === 'deleted'` and removes related notes and report versions, returning counts to confirm data cleanup.
10. **Keyboard Accessible Menus:**
    - Block action menus use `focus-within:opacity-100` so keyboard users can access `Save to Notebook` actions via Tab navigation without needing mouse hover.

---

## Deferred

- PDF Export (explicitly out of scope for v1 in PRODUCT_SPEC §1 and §3.6; DOCX and Markdown are supported).
- Multi-user authentication & cloud sync (v1 is single-user, local-first on 127.0.0.1).
- Live market-data feeds (prices, market cap, EV are sourced only from filings/articles with `asOf`).

---

## Known issues

- None. All 100 unit tests and 13 E2E test suites pass with zero warnings or errors.

---

## Dependencies added

- No dependencies added beyond the fixed stack defined in `AGENTS.md`.
