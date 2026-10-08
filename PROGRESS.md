# Deal Desk — Progress & Milestones

## Milestones Summary

| Milestone | Title | Status |
|---|---|---|
| **M0** | Plan (no app code) | Done |
| **M1** | Foundation | Done |
| **M2** | Welcome, dashboard, discovery, quick preview, Recycle Bin | Done |
| **M3** | Deep research report | In Progress |
| **M4** | Notebook and export | Not Started |
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

---

## Decisions

1. **Discovery Queue Persistence:**
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
