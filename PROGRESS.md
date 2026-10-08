# Deal Desk — Progress & Milestones

## Milestones Summary

| Milestone | Title | Status |
|---|---|---|
| **M0** | Plan (no app code) | Done |
| **M1** | Foundation | Done |
| **M2** | Welcome, dashboard, discovery, quick preview, Recycle Bin | Done |
| **M3** | Deep research report | Done |
| **M4** | Notebook and export | In Progress |
| **M5** | Live providers (contract tests, recorded responses) | Not Started |
| **M6** | Hardening and handoff | Not Started |

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

---

## Decisions

1. **Deep Report Versioning:**
   - Reports are stored immutably with auto-incrementing `version` numbers per deal.
   - Refreshes run asynchronously via `deepPipeline`, letting the user browse and read prior report versions while a refresh runs in the background.
2. **FactValue Strict Rendering:**
   - Enforced value status visibility (`verified`, `single_source`, `unverified`, `not_found`, `not_publicly_disclosed`) directly in DOM structure to satisfy AC10.
3. **Discovery Queue Persistence:**
   - Queue groups (On hold, Restored, Current results) are calculated dynamically on the server from the latest search run and deals database.
2. **Dynamic Route Rendering:**
   - Explicitly configured `export const dynamic = 'force-dynamic'` on `/api/search/current` to ensure freshest SQLite state is returned upon every client poll.
3. **Responsive Tab Switcher:**
   - Under 1024px, the 3 desktop columns collapse into mobile tabs (`My Deals`, `Results`, `Workspace`), automatically focusing on `Workspace` when a user clicks a deal card.
4. **Permanent Removal Guard:**
   - Purge permanently checks `deal.userStatus === 'deleted'` and removes related notes and report versions, returning counts to confirm data cleanup.

---

## Deferred

- PDF Export (explicitly out of scope for v1 in PRODUCT_SPEC §1 and §3.6; DOCX and Markdown are supported).
- Multi-user authentication & cloud sync (v1 is single-user, local-first on 127.0.0.1).
- Live market-data feeds (prices, market cap, EV are sourced only from filings/articles with `asOf`).

---

## Known issues

- None at M2.

---

## Dependencies added

- No new dependencies added in M2 (used fixed stack from M1).
