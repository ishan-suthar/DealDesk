# Deal Desk — System Plan (M0)

## 1. Directory & File Tree

```
src/
├── app/
│   ├── layout.tsx                     # Root layout with Tailwind, Inter font, toast provider
│   ├── page.tsx                       # Welcome screen (/)
│   ├── research/
│   │   └── page.tsx                   # Research dashboard (/research) - 3 columns / tabs
│   ├── notebook/
│   │   └── page.tsx                   # Notebook view (/notebook)
│   ├── recycle-bin/
│   │   └── page.tsx                   # Recycle bin (/recycle-bin)
│   ├── settings/
│   │   └── page.tsx                   # Settings (/settings)
│   └── api/
│       ├── search/
│       │   ├── route.ts               # POST: start search run
│       │   └── current/route.ts       # GET: current search run & queue deals
│       ├── deals/
│       │   ├── route.ts               # GET: list deals (by userStatus / filters)
│       │   └── [id]/
│       │       ├── route.ts           # GET: get deal by ID; DELETE: purge deal
│       │       ├── status/route.ts    # PATCH: transition user status (409 on invalid)
│       │       └── reports/
│       │           ├── route.ts       # GET: list/latest reports; POST: start deep research
│       │           └── [version]/route.ts # GET: report version
│       ├── jobs/
│       │   └── [id]/
│       │       ├── route.ts           # GET: poll job status (heartbeat, stage, progress)
│       │       └── cancel/route.ts    # POST: cancel job
│       ├── notes/
│       │   ├── route.ts               # GET: list notes (filters/search); POST: create note
│       │   └── [id]/route.ts          # PATCH: edit/pin/position; DELETE: delete note
│       ├── export/
│       │   └── [dealId]/route.ts      # GET: export report & notes as DOCX or Markdown
│       └── settings/
│           ├── route.ts               # GET, PATCH display name / settings
│           └── reset-demo/route.ts    # POST: reset demo fixtures
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx             # Header / top navigation
│   │   └── DemoBanner.tsx             # Persistent Demo data banner
│   ├── facts/
│   │   ├── FactValue.tsx              # Core fact renderer with valueStatus badge & tooltip
│   │   ├── CitationBadge.tsx          # S# clickable badge linked to sources
│   │   └── AnalysisBadge.tsx          # Analysis — not investment advice tag
│   ├── research/
│   │   ├── SearchControls.tsx         # Sector, subsector, window, deal count, status, geo
│   │   ├── FilterChips.tsx            # Active filter chips
│   │   ├── ProgressStage.tsx          # 4 discovery stages indicator
│   │   ├── QueueGroup.tsx             # On hold, Restored, Current results groups
│   │   ├── DealCard.tsx               # Discovery deal card with evidence badge & ranking reasons
│   │   └── QuickPreview.tsx           # High-signal screening info + 3 footer buttons
│   ├── report/
│   │   ├── DeepReportView.tsx         # Template sections in TEMPLATE_MAPPING order
│   │   ├── ReportHeader.tsx           # Deal info, version selector, Refresh research, Remove
│   │   ├── BlockActionMenu.tsx        # Keyboard-reachable block action menu
│   │   ├── FloatingNotebookButton.tsx # Floating Save to Notebook on text selection
│   │   ├── SourcesSection.tsx         # Consolidated sources list with open questions
│   │   └── Sections/
│   │       ├── SnapshotSection.tsx    # Section 1: Deal snapshot
│   │       ├── CompaniesSection.tsx   # Section 2: Company overview (Buyer vs Target)
│   │       ├── MechanicsSection.tsx   # Section 3: Deal summary & mechanics
│   │       └── RationaleSection.tsx   # Section 4: Rationale & judgment
│   ├── notebook/
│   │   ├── NoteCard.tsx               # Note display with quote, block anchor, comment, pin
│   │   ├── NoteEditor.tsx             # Manual note / edit note form
│   │   └── NoteFilters.tsx            # Deal filter, section filter, full-text search
│   ├── recycle-bin/
│   │   └── DeletedDealRow.tsx         # Deleted deal with restore & permanent purge dialog
│   └── ui/                            # Radix primitives: dialog, toast, dropdown, select, button
├── domain/
│   ├── enums.ts                       # ValueStatus, SourceType, TransactionStatus, UserStatus, etc.
│   ├── types.ts                       # Inferred Zod types for entities (Source, Deal, Claim, etc.)
│   ├── schemas.ts                     # Zod boundary schemas for all entities and API payloads
│   ├── taxonomy.ts                    # Sectors and subsectors
│   ├── template.ts                    # Deep report template definition (keys, labels, field rules)
│   └── userStatus.ts                  # Pure state machine transition(current, action) -> next
├── server/
│   ├── db/
│   │   ├── client.ts                  # better-sqlite3 + Drizzle database connection
│   │   └── schema.ts                  # Drizzle table definitions
│   ├── repositories/
│   │   ├── dealsRepository.ts         # Deal queries, deduplication, search updates
│   │   ├── reportsRepository.ts       # Report versions, latest report fetch
│   │   ├── notesRepository.ts         # Notes CRUD, search, reorder
│   │   ├── sourcesRepository.ts       # Source packs, URL deduplication
│   │   ├── jobsRepository.ts          # Job creation, heartbeat, status updates
│   │   └── settingsRepository.ts      # User display name, mode
│   ├── services/
│   │   ├── pipeline.ts                # Discovery & deep research orchestrator
│   │   ├── verification.ts            # 8 verification rules (provenance, numbers, status ceiling)
│   │   ├── ranking.ts                 # Algorithmic deal scoring & reason generator
│   │   ├── normalizer.ts              # Company name normalization, dedupeKey generation
│   │   ├── sourceClassifier.ts        # Source type classification by domain allowlist
│   │   ├── calculations.ts            # EV/EBITDA, EV/Revenue, premium computations
│   │   ├── edgarClient.ts             # SEC EDGAR client with rate limiting & User-Agent
│   │   └── export/
│   │       ├── buildExportDocument.ts # Format-neutral intermediate ExportDocument model
│   │       ├── renderDocx.ts          # DOCX exporter using `docx`
│   │       └── renderMarkdown.ts      # Markdown exporter
│   ├── providers/
│   │   ├── types.ts                   # ResearchProvider interface, GatherEvent, ExtractRequest
│   │   ├── providerFactory.ts         # Select provider (demo, anthropic, gemini, failing_test)
│   │   ├── demo/
│   │   │   └── demoProvider.ts        # Deterministic fixture provider with simulated stages
│   │   ├── anthropic/
│   │   │   ├── config.ts              # Tool versions and model config
│   │   │   └── anthropicAdapter.ts    # Gather (tools) + Extract (structured output)
│   │   ├── gemini/
│   │   │   └── geminiAdapter.ts       # Gather (Google Search grounding) + Extract
│   │   ├── test/
│   │   │   └── failingTestProvider.ts # Provider simulating failures, budget, zero results
│   │   └── prompts/
│   │       ├── v1_discovery.ts        # Discovery extraction prompt
│   │       └── v1_deep_section.ts     # Per-section deep research extraction prompts
│   └── jobs/
│       ├── jobRunner.ts               # In-process singleton job runner with heartbeat
│       └── budgetManager.ts           # Usage tracker and DAILY_SEARCH_CAP enforcer
└── fixtures/
    ├── demoDeals.ts                   # 10 fictional deals (Maple Crest, Tallgrass, Oakmoss, etc.)
    └── demoReports.ts                 # Fixture #1 deep report v1 + 3 notes
tests/
├── unit/
│   ├── userStatus.test.ts             # State machine valid/invalid transitions
│   ├── normalizer.test.ts             # Company aliases, dedupeKey, canonical URLs
│   ├── verification.test.ts           # Verification rules 1-8, number matching, provenance
│   ├── ranking.test.ts                # Ranking feature scoring, top reasons
│   ├── calculations.test.ts           # Multiples & premiums with status ceiling
│   ├── exportDocument.test.ts         # Export document structure, legend, section order
│   ├── fixturesSanity.test.ts         # Enforce all fixture URLs under https://example.com/demo/
│   └── systemStates.test.ts           # AC9: every system state rendering & provider fallback
└── e2e/
    ├── ac1_welcome.spec.ts            # AC1: Welcome -> Start researching -> /research
    ├── ac2_discovery.spec.ts          # AC2: Demo discovery run, 4 stages, >=3 cards, demo banner
    ├── ac3_quick_preview.spec.ts      # AC3: Quick preview fields, source links, 3 footer buttons
    ├── ac4_save_deal.spec.ts          # AC4: Save to My Deals -> left rail persistence
    ├── ac5_deep_report.spec.ts        # AC5: Auto-start report, Refresh research, version history
    ├── ac6_notebook.spec.ts           # AC6: Text selection -> Save to Notebook -> search in /notebook
    ├── ac7_recycle_bin.spec.ts        # AC7: Reject -> undo, Recycle bin restore -> prior status
    └── ac8_export.spec.ts             # AC8: DOCX & Markdown download validation
```

---

## 2. Drizzle Database Tables

All tables defined in `src/server/db/schema.ts` targeting SQLite:

1. **`settings`**
   - `id`: `text` (primary key, default `'default'`)
   - `displayName`: `text` (not null, default `'Nikita'`)
   - `researchMode`: `text` (not null, default `'demo'`)
   - `updatedAt`: `text` (not null)

2. **`companies`**
   - `id`: `text` (primary key)
   - `name`: `text` (not null)
   - `aliases`: `text` (mode: `'json'`, `string[]`)
   - `ticker`: `text`
   - `exchange`: `text`
   - `cik`: `text`
   - `hqCountry`: `text`
   - `isSponsor`: `integer` (mode: `'boolean'`, not null)
   - `createdAt`: `text` (not null)

3. **`sources`**
   - `id`: `text` (primary key)
   - `jobId`: `text` (not null)
   - `origin`: `text` (not null, enum `demo` | `live`)
   - `url`: `text` (not null)
   - `publisher`: `text` (not null)
   - `title`: `text` (not null)
   - `publishedAt`: `text`
   - `accessedAt`: `text` (not null)
   - `sourceType`: `text` (not null, enum: `primary`, `strong_secondary`, `contextual`, `discovery`)
   - `retrievedVia`: `text` (not null, enum: `search_result`, `fetch`, `edgar`, `fixture`)
   - `reliabilityNote`: `text`
   - `excerpt`: `text`

4. **`deals`**
   - `id`: `text` (primary key)
   - `origin`: `text` (not null, enum `demo` | `live`)
   - `dedupeKey`: `text` (not null, indexed)
   - `headline`: `text` (not null)
   - `sector`: `text` (not null)
   - `subsectors`: `text` (mode: `'json'`, `string[]`)
   - `geographyRegion`: `text` (not null)
   - `buyerIds`: `text` (mode: `'json'`, `string[]`)
   - `targetIds`: `text` (mode: `'json'`, `string[]`)
   - `sellerIds`: `text` (mode: `'json'`, `string[]`)
   - `announcementDate`: `text` (mode: `'json'`, `FactValue<string>`)
   - `closingDate`: `text` (mode: `'json'`, `FactValue<string>`)
   - `transactionStatus`: `text` (not null)
   - `transactionStatusSourceIds`: `text` (mode: `'json'`, `string[]`)
   - `userStatus`: `text` (not null, enum: `discovered`, `review`, `saved`, `deleted`)
   - `statusBeforeDelete`: `text` (enum: `discovered`, `review`, `saved`)
   - `dealValue`: `text` (mode: `'json'`, `FactValue<Money>`)
   - `quickPreview`: `text` (mode: `'json'`, `QuickPreview`)
   - `ranking`: `text` (mode: `'json'`, `{ score: number, features: Record<string, number>, reasons: string[] }`)
   - `firstSeenRunId`: `text` (not null)
   - `searchRunIds`: `text` (mode: `'json'`, `string[]`)
   - `deletedAt`: `text`
   - `createdAt`: `text` (not null)
   - `updatedAt`: `text` (not null)

5. **`research_reports`**
   - `id`: `text` (primary key)
   - `dealId`: `text` (not null, references `deals.id`)
   - `version`: `integer` (not null)
   - `jobId`: `text` (not null)
   - `provider`: `text` (not null)
   - `model`: `text` (not null)
   - `promptVersion`: `text` (not null)
   - `sections`: `text` (mode: `'json'`, `ReportSection[]`)
   - `openQuestions`: `text` (mode: `'json'`, `string[]`)
   - `sourceIds`: `text` (mode: `'json'`, `string[]`)
   - `createdAt`: `text` (not null)

6. **`notes`**
   - `id`: `text` (primary key)
   - `dealId`: `text` (references `deals.id`)
   - `templateSection`: `text`
   - `quote`: `text`
   - `blockId`: `text`
   - `coveredBlockIds`: `text` (mode: `'json'`, `string[]`)
   - `sourceIds`: `text` (mode: `'json'`, `string[]`)
   - `reportVersionId`: `text`
   - `comment`: `text` (not null)
   - `pinned`: `integer` (mode: `'boolean'`, not null, default false)
   - `position`: `integer` (not null, default 0)
   - `createdAt`: `text` (not null)
   - `updatedAt`: `text` (not null)

7. **`search_runs`**
   - `id`: `text` (primary key)
   - `filters`: `text` (mode: `'json'`, `SearchFilters`)
   - `provider`: `text` (not null)
   - `origin`: `text` (not null)
   - `jobId`: `text` (not null)
   - `resultDealIds`: `text` (mode: `'json'`, `string[]`)
   - `excluded`: `text` (mode: `'json'`, `{ reason: string, label: string }[]`)
   - `startedAt`: `text` (not null)
   - `finishedAt`: `text`

8. **`jobs`**
   - `id`: `text` (primary key)
   - `kind`: `text` (not null, enum: `discovery` | `deep_research`)
   - `dealId`: `text` (nullable, for deep research)
   - `status`: `text` (not null, enum: `queued` | `running` | `succeeded` | `failed` | `cancelled`)
   - `stage`: `text`
   - `progress`: `integer` (not null, 0..100)
   - `error`: `text` (mode: `'json'`, `{ code: string, message: string }`)
   - `usage`: `text` (mode: `'json'`, `{ searches: number, fetches: number, inputTokens: number, outputTokens: number }`)
   - `startedAt`: `text`
   - `heartbeatAt`: `text`
   - `finishedAt`: `text`
   - `createdAt`: `text` (not null)

---

## 3. API Routes Specification

All routes run on Node.js runtime (`export const runtime = 'nodejs'`). Validate all bodies and query parameters with Zod; return 400 with a readable error message on validation failure.

| Method | Path | Input (Zod schema) | Success Response | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/search` | `SearchFiltersSchema`: `{ sector: string, subsectors?: string[], timeWindow: '30d'\|'90d'\|'12m'\|'custom', customStartDate?: string, customEndDate?: string, maxDeals: 5\|10\|15\|25, dealStatus: 'pending'\|'closed'\|'terminated'\|'any', includeRumored: boolean, geography: 'US'\|'North America'\|'Europe'\|'Global' }` | `{ runId: string, jobId: string }` | 201 (Created), 400 (Bad Request), 409 (Job already running) |
| `GET` | `/api/search/current` | None | `{ run: SearchRun \| null, queue: { onHold: Deal[], restored: Deal[], currentResults: Deal[] }, hiddenCount: number }` | 200 |
| `GET` | `/api/deals` | `Query`: `{ userStatus?: UserStatus, sector?: string, search?: string }` | `{ deals: Deal[] }` | 200, 400 |
| `GET` | `/api/deals/:id` | `Params`: `{ id: string }` | `{ deal: Deal, sources: Source[], companies: Company[] }` | 200, 404 (Not Found) |
| `PATCH` | `/api/deals/:id/status` | `Body`: `{ action: 'hold' \| 'unhold' \| 'save' \| 'reject' \| 'remove' \| 'restore' }` | `{ deal: Deal, previousStatus: UserStatus }` | 200, 400, 404, 409 (Invalid transition per state machine) |
| `DELETE` | `/api/deals/:id` | None | `{ success: true, deletedDealId: string, purgedNotesCount: number, purgedReportsCount: number }` | 200, 404, 409 (Cannot purge unless status is deleted) |
| `GET` | `/api/deals/:id/reports` | None | `{ reports: ResearchReportSummary[], latest: ResearchReport \| null }` | 200, 404 |
| `GET` | `/api/deals/:id/reports/:version` | `Params`: `{ id: string, version: number }` | `{ report: ResearchReport, sources: Source[] }` | 200, 404 |
| `POST` | `/api/deals/:id/reports` | None | `{ jobId: string, version: number }` | 201, 404, 409 (Deep research already in progress) |
| `GET` | `/api/jobs/:id` | `Params`: `{ id: string }` | `{ job: Job }` | 200, 404 |
| `POST` | `/api/jobs/:id/cancel` | `Params`: `{ id: string }` | `{ success: true }` | 200, 404 |
| `GET` | `/api/notes` | `Query`: `{ dealId?: string, templateSection?: string, search?: string }` | `{ notes: Note[] }` | 200, 400 |
| `POST` | `/api/notes` | `CreateNoteSchema`: `{ dealId?: string, templateSection?: string, quote?: string, blockId?: string, coveredBlockIds?: string[], sourceIds?: string[], reportVersionId?: string, comment: string, pinned?: boolean }` | `{ note: Note }` | 201, 400 |
| `PATCH` | `/api/notes/:id` | `UpdateNoteSchema`: `{ comment?: string, pinned?: boolean, position?: number }` | `{ note: Note }` | 200, 400, 404 |
| `DELETE` | `/api/notes/:id` | None | `{ success: true }` | 200, 404 |
| `GET` | `/api/export/:dealId` | `Query`: `{ format: 'docx' \| 'markdown' }` | Binary DOCX stream with `Content-Disposition: attachment; filename=...` OR Markdown text file | 200, 400, 404 |
| `GET` | `/api/settings` | None | `{ displayName: string, researchMode: string }` | 200 |
| `PATCH` | `/api/settings` | `UpdateSettingsSchema`: `{ displayName: string }` | `{ displayName: string, researchMode: string }` | 200, 400 |
| `POST` | `/api/settings/reset-demo` | None | `{ success: true }` | 200, 403 (Forbidden if in live mode) |

---

## 4. Job Runner, Polling & Provider Architecture

### 4.1 In-Process Job Runner
- **Singleton Pattern:** Managed via `globalThis.__dealDeskJobRunner` to avoid duplicates across Next.js API reloads.
- **Heartbeat & Liveness:** Every running job updates its `heartbeatAt` every 5 seconds. On server startup, any job in `running` state with `heartbeatAt` older than 2× timeout (600s) is marked `failed` with error `{ code: 'interrupted', message: 'Job was interrupted by server restart' }`.
- **Concurrency control:**
  - Max 1 discovery job running at a time.
  - Max 1 deep-research job per deal at a time. If requested again, returns the existing job ID.
- **Cancellation:** Supports `AbortController` linked to job cancellation and timeouts (120s for discovery, 300s for deep research).

### 4.2 Polling Pattern
- Client polls `GET /api/jobs/:id` every 1,000 ms while `status` is `queued` or `running`.
- When `status` changes to `succeeded`, client fetches final result or refreshes queue / report.
- Incremental results: For discovery, newly extracted deals are committed to the DB as they pass verification; `GET /api/search/current` returns cards progressively.

### 4.3 Provider Selection & Fallback
- Configured by `RESEARCH_PROVIDER` env variable: `demo` (default), `anthropic`, `gemini`, or `failing_test`.
- If `anthropic` or `gemini` is selected but the respective API key is absent:
  - System logs a warning and automatically falls back to `demo` provider.
  - Returns a visible notice in UI: `"Live research isn't configured. Running in demo mode."`.
- Provider contract tests run entirely against recorded response fixtures (zero network in unit tests).

---

## 5. Acceptance Criteria Test Mapping (AC1–AC10)

| AC | Description | Test Type | Test File | Key Test Assertions |
|---|---|---|---|---|
| **AC1** | Welcome to Research navigation | E2E | `tests/e2e/ac1_welcome.spec.ts` | Navigates to `/`, asserts heading `Welcome Nikita`, clicks `Start researching`, verifies URL is `/research`. |
| **AC2** | Demo discovery run with stages and banner | E2E | `tests/e2e/ac2_discovery.spec.ts` | Sets Consumer & Retail / Food & Beverage / Last 90 days, clicks `Find deals`, verifies `Demo data` banner, verifies all 4 stages appear in order (`Finding candidates` -> `Checking primary sources` -> `Extracting deal facts` -> `Ranking for interview usefulness`), verifies ≥3 cards returned. |
| **AC3** | Quick preview fields, sources & footer buttons | E2E | `tests/e2e/ac3_quick_preview.spec.ts` | Clicks a card, verifies headline, summary, background, parties, advisers (or "Not yet found"), deal value with FactValue status, differentiators/drivers with Analysis tag, sources list, and exactly 3 buttons in order: `Save to My Deals`, `Hold for review`, `I don't like this deal`. |
| **AC4** | Save to My Deals & left rail persistence | E2E | `tests/e2e/ac4_save_deal.spec.ts` | Clicks `Save to My Deals`, verifies toast "Saved to My Deals", verifies card in left rail with transaction status chip; reloads page, verifies deal persists in left rail. |
| **AC5** | Saved deal deep research & versioning | E2E + Unit | `tests/e2e/ac5_deep_report.spec.ts`<br>`tests/unit/pipeline.test.ts` | Clicking unsaved-report deal triggers job; clicking existing report shows "Last researched...", `Refresh research`, creates v2, allows selecting v1 from version menu; unit test asserts report versioning integrity and immutability. |
| **AC6** | Select text, save to Notebook & search | E2E | `tests/e2e/ac6_notebook.spec.ts` | Highlights report text, clicks floating `Save to Notebook`, verifies focus moves to comment, enters comment, navigates to `/notebook`, reloads, searches for quote/comment, asserts note found with version and block anchor. |
| **AC7** | Reject -> undo; Recycle Bin restore & purge | E2E + Unit | `tests/e2e/ac7_recycle_bin.spec.ts`<br>`tests/unit/userStatus.test.ts` | Rejects deal -> clicks Undo on toast -> restored; rejects deal -> navigates to `/recycle-bin` -> clicks `Restore` -> deal restored to prior status with intact notes & versions; test permanent remove purge with confirmation dialog. |
| **AC8** | DOCX & Markdown export compliance | Unit + E2E | `tests/unit/exportDocument.test.ts`<br>`tests/e2e/ac8_export.spec.ts` | Unit: asserts `ExportDocument` has sections 1-4 in order, notes grouped by section with quote and source links, render-state legend, no fact lacks status. E2E: triggers DOCX & MD download, verifies non-empty file generated. |
| **AC9** | System states coverage | Unit / Component | `tests/unit/systemStates.test.ts` | Verifies all 8 states in PRODUCT_SPEC §3.8: Empty search, Empty saved, Loading skeleton, No results, Partial results, Source failure, Provider error/not configured, Budget reached using `failing_test` provider. |
| **AC10** | FactValue status requirement & unknown source downgrade | Unit | `tests/unit/verification.test.ts` | Asserts verification downgrades claims citing unknown source IDs; asserts numeric claims without matching text in sources are downgraded to `not_found`; asserts every fact has `valueStatus`. |
