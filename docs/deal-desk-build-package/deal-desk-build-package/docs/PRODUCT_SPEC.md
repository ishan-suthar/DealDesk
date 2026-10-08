# Product Specification — Deal Desk

## 1. Purpose and user

Deal Desk is a private, single-user research workspace for Nikita, a Booth MBA student recruiting for Investment Banking. It helps her discover recent M&A deals, decide quickly which are worth learning, and build sourced deal briefs and personal notes for coffee chats. The first target sector is Consumer & Retail; the taxonomy supports other sectors.

**Primary outcome:** from a search to a credible, personal talking-point brief in under 15 minutes. A useful brief answers: what happened, who advised it, what it was worth (and on what basis), why it happened, whether it has closed, what makes it distinctive, and which market trend it illustrates.

**Out of scope for v1:** multi-user accounts, auth, cloud sync, PDF export, a licensed market-data feed, dark mode, mobile-first polish beyond "usable".

## 2. Global concepts

### 2.1 Two independent statuses

Every deal has two statuses that must never be merged into one field:

- **Transaction status** (facts about the world): `rumored`, `pending`, `closed`, `terminated`, `unknown`. "Pending" means announced/signed but not closed or terminated.
- **User status** (Nikita's workflow): `discovered`, `review`, `saved`, `deleted`.

### 2.2 User-status state machine

Implement as a pure function `transition(current, action) → next` in `src/domain/userStatus.ts`. Invalid transitions throw a typed error and are rejected by the API with 409.

| From | Action | To | Side effects |
| --- | --- | --- | --- |
| discovered | hold | review | stays in queue, "On hold" chip |
| review | unhold | discovered | — |
| discovered / review | save | saved | appears in left rail; success toast "Saved to My Deals" |
| discovered / review | reject (`I don't like this deal`) | deleted | `statusBeforeDelete` recorded; undo toast (8 s) |
| saved | remove (`Remove from My Deals`, in the deep-report header menu) | deleted | research versions and notes are kept |
| deleted | restore | value of `statusBeforeDelete` | returns to its queue group or the left rail |
| deleted | purge (`Permanently remove`) | (row removed) | confirmation dialog states how many notes and report versions will also be removed |

Undo on the toast is the same as `restore`.

### 2.3 Search runs and the discovery queue

- Each `Find deals` click creates a **SearchRun** that stores its filters, start/end time, provider, stage, and result IDs.
- The center queue shows three groups, top to bottom: **On hold** (all `review` deals from any run), **Restored** (deals restored to `discovered` whose run is not the current run), **Current results** (the latest run).
- Saved deals stay visible in the queue with a `Saved` chip; deleted deals are hidden, with a line "N hidden in Recycle Bin".
- **Deduplication across runs:** if a new run finds a deal that already exists (see DATA_AND_RESEARCH → Normalize), reuse the existing record and keep its user status.
- The queue persists across page refreshes.

## 3. Screens and flows

### 3.1 Welcome (`/`)

- Full-page screen with heading `Welcome {displayName}` (default `Nikita`), supporting line `Find a deal worth talking about.`, and one primary button `Start researching` that routes to `/research`.
- `displayName` is stored in the settings table and editable at `/settings`.

### 3.2 Settings (`/settings`)

Minimal page: display name (editable), research mode (read-only display: `Demo` or `Live — {provider}`), and a short note explaining that live mode is configured via server environment variables. Include `Reset demo data` (with confirmation) when in demo mode.

### 3.3 Research dashboard (`/research`)

Three-column desktop layout, usable at 1280 px wide. Below 1024 px the columns become tabs (`My Deals`, `Results`, `Workspace`).

| Area | Purpose | Required interactions |
| --- | --- | --- |
| Left rail | Nikita's durable study list | Searchable saved-deal list with transaction-status chips and "researched X ago"; links to Notebook and Recycle Bin |
| Center panel | Temporary discovery queue | Groups from §2.3, progress, result count, applied filters, `Collapse results` / `Show results` |
| Right workspace | Preview or deep report | Quick preview, deep report, selection-to-note, loading/error/empty states |

A persistent `Demo data` banner appears at the top of the dashboard in demo mode.

#### Search controls (top bar)

1. **Sector** (single select): Consumer & Retail (default), Healthcare, Real Estate, Technology, Financial Institutions, Industrials, Energy & Power, Media & Telecom.
2. **Subsector** (multi-select, filtered by sector; empty = all). Consumer & Retail: Food & Beverage, Consumer Products, Retail, E-commerce & Marketplaces, Restaurants, Beauty & Personal Care, Apparel & Luxury, Household Products, Pet, Home & Leisure, Consumer Services. Other sectors: define 5–8 standard subsectors each in `src/domain/taxonomy.ts`.
3. **Time window**: Last 30 days, Last 90 days (default), Last 12 months, Custom dates (start ≤ end ≤ today, max span 24 months). Applies to the **announcement date** (or first-report date for rumored deals), computed from server `today`.
4. **Number of deals**: 5, 10 (default), 15, 25. This is a **maximum**, never a target to pad.
5. **Deal status**: Pending, Closed, Terminated, Any (default). A separate checkbox `Include rumored deals` (default off).
6. **Geography**: U.S. (default), North America, Europe, Global. Matches when the **target** (or the divested business) is headquartered in the region.

`Find deals` is disabled while a run is in progress and while filters are invalid. The applied filters are shown as chips above the results.

#### Discovery run

- Opening or expanding the center panel is automatic when a run starts.
- Progress stages, shown in order: `Finding candidates` → `Checking primary sources` → `Extracting deal facts` → `Ranking for interview usefulness`.
- Result cards appear as they are produced. Each card: buyer → target, announcement date, one-line label, transaction-status chip, evidence badge (`Primary source` / `Secondary only`), and the top 2–3 ranking reasons.
- Result summary line: "Found N verified deals (up to M requested)". If N < M, add: "Fewer deals met the evidence bar than requested."
- Clicking a card opens the **quick preview** in the right workspace. It never triggers deep research.
- If the run fails partway, keep the cards already produced and show "Search stopped early: {reason}. Showing N results found before the error."

### 3.4 Quick preview (right workspace)

Show only high-signal screening information, each fact with inline citation badges:

- Headline and one-sentence summary
- Background (2–4 sentences)
- Parties and roles (buyer, target, seller if relevant; mark sponsors)
- Advisers: financial advisers and legal advisers in separate lists; show `Not yet found` when none are sourced
- Deal value with currency and value type (e.g., "$4.2bn enterprise value"), plus multiples only if sourced
- Announcement date, transaction status, expected/actual closing timing
- Differentiating insights (labeled `Analysis` if not directly stated by a source)
- Deal drivers / sector trends (labeled `Analysis` where synthesized)
- Sources list for the preview

Footer, always exactly these three buttons in this order: `Save to My Deals` · `Hold for review` · `I don't like this deal`. For a `review` deal the middle button reads `Remove hold`. For a `saved` deal the footer shows "Saved to My Deals" and an `Open research` button instead.

### 3.5 Saved-deal deep research

- Clicking a saved deal in the left rail opens its latest report. If **no report exists**, a deep-research job starts automatically. If a report exists, it is shown with "Last researched {relative time}" and a `Refresh research` button. Reports older than 7 days show a subtle "May be out of date" hint; they never auto-refresh.
- During a job: the prior report stays visible; a non-blocking progress bar shows stage names; the user can keep reading and annotating. A job can be cancelled.
- A refresh creates a **new report version**; prior versions remain accessible from a version menu.
- The report follows `TEMPLATE_MAPPING.md` exactly, with citation badges next to claims and a consolidated Sources section. Facts, analysis, and unknowns are visually distinct (see render states).

### 3.6 Notebook

**Saving from the report**
- Selecting text inside a single report block shows a floating `Save to Notebook` button. Every report block also has a keyboard-reachable action menu with `Save to Notebook` (saves the whole block) for accessibility.
- If a selection spans multiple blocks, anchor to the first block and record all covered block IDs.
- Max saved selection: 2,000 characters (show a message if longer).
- The note card stores: selected text, block ID, section key, covered source IDs, report version ID, timestamp, and an editable personal comment (focus moves to the comment field after saving).

**Notebook view (`/notebook`)**
- Filter by deal and by template section; full-text search over quotes and comments.
- Add manual note (optional deal + optional template section).
- Edit, delete (with undo toast), pin, and reorder (drag handle plus `Move up`/`Move down` keyboard buttons).
- Notes always show which report version their quote came from; if a newer version exists, show "From an earlier report version".

**Export**
- `Export` per deal: **DOCX** (primary) and **Markdown**. PDF is deferred.
- Layout follows `TEMPLATE_MAPPING.md` → Export layout. Missing fields print `Not publicly disclosed` or `Not available from reviewed sources` per their render state. Never manufacture a number or adviser.

### 3.7 Recycle Bin (`/recycle-bin`)

- Lists deleted deals with deletion date, prior status, and the original search filters (as chips).
- `Restore` returns the deal per §2.2. `Permanently remove` requires a confirmation dialog.
- State persists across refreshes.

### 3.8 System states (each must exist and be reachable in tests)

| State | Where | Copy (minimum) |
| --- | --- | --- |
| Empty: no search yet | Center | "Set your filters and click Find deals." |
| Empty: no saved deals | Left rail | "Deals you save will appear here." |
| Loading | Center/right | Stage name + skeleton |
| No results | Center | "No deals met the evidence bar for these filters. Try a longer time window or more subsectors." |
| Partial results | Center | see §3.3 |
| Source failure | Right | "Some sources could not be retrieved. Facts that depended on them are marked Not found." |
| Provider error / not configured | Center/right | "Live research isn't configured. Running in demo mode." or the specific error |
| Budget reached | Center/right | "Search budget for this run was reached; results may be incomplete." |

The app must never show a success state for a run that produced zero verified sources.

## 4. Ranking logic

The score is computed **in code** (`src/server/services/ranking.ts`) from structured features the provider extracts with evidence. The model never produces the final score.

| Feature | Weight | How it is computed |
| --- | --- | --- |
| Sector/subsector relevance | 30% | 1.0 if target's primary subsector is in the selected subsectors (or any subsector of the sector when none selected); 0.5 if adjacent; 0 otherwise |
| Recency | 20% | Linear from 1.0 (announced today) to 0 (start of window) |
| Significance/value | 15% | Log-scaled disclosed value; undisclosed = 0.3 |
| Primary-source evidence | 15% | 1.0 primary source present; 0.4 strong secondary only |
| Strategic rationale / trend relevance | 15% | 1.0 if a sourced rationale and at least one trend tag; 0.5 if one; 0 none |
| Coffee-chat novelty | 5% | 0.25 per tag, max 1.0: carve-out, sponsor involvement, contested/competing bid, activist angle, cross-border, regulatory review, unusual structure |

Show the top 2–3 contributing reasons on each card and a full breakdown in a tooltip. Saving any deal overrides ranking (no deal is hidden for ranking reasons; ranking only orders).

## 5. Non-negotiable quality rules

- Never present model-generated text as a verified fact without a source.
- Each fact block has ≥1 linked source showing publisher and publication/filing date.
- Prefer primary sources for transaction facts (merger agreement, proxy, 8-K, company press release, investor presentation, regulatory decision). Use reputable financial media for context and adviser confirmation.
- State values with units and type: `$4.2bn enterprise value`, never `$4.2bn`.
- Rumored deals are labeled `Reported — not announced` and never show `Verified` facts.
- Conflicts are surfaced: show both values, both sources, and the likely metric difference when knowable.
- Adviser fees, fairness opinions, detailed synergy targets, and confidential terms show `Not publicly disclosed` until a source exists.

## 6. Acceptance criteria (each maps to at least one automated test)

| # | Criterion | Test |
| --- | --- | --- |
| AC1 | From `/`, one click on `Start researching` reaches `/research`. | E2E |
| AC2 | In demo mode with no API keys, Consumer & Retail / Food & Beverage / Last 90 days returns ≥3 result cards, shows all four progress stages, and the `Demo data` banner. | E2E |
| AC3 | Clicking a result shows every quick-preview field (or its explicit not-found state), source links, and exactly the three prescribed buttons. | E2E |
| AC4 | `Save to My Deals` adds the deal to the left rail; reload keeps it there. | E2E |
| AC5 | Opening a saved deal with no report starts a job; with an existing report shows it plus `Refresh research`; refresh creates version n+1 and keeps version n accessible. | E2E + unit |
| AC6 | Selecting report text and clicking `Save to Notebook` creates a note with quote, block ID, section, version, timestamp; the note is findable by search in `/notebook` after reload. | E2E |
| AC7 | `I don't like this deal` → undo restores; delete → Recycle Bin → `Restore` returns it to its prior status with no data loss (notes and versions intact for saved deals). | E2E + unit |
| AC8 | DOCX and Markdown exports follow the template section order, include notes grouped by section with quote and source link, include the render-state legend, and contain no field value lacking a status. | unit (export model) + E2E download |
| AC9 | Every system state in §3.8 renders (via fixtures or a test-only failure provider). | unit/component |
| AC10 | No fact renders without a `valueStatus`; a claim with an unknown source ID is downgraded server-side. | unit |
