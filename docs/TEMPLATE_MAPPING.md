# Deal Template and Notebook Mapping — Deal Desk

The template is the governing order for a saved deal's deep report, the extraction schema, and the export. Encode it **once** in `src/domain/template.ts` (section keys, field keys, labels, tooltips, field rules). The UI, the extraction prompts/schemas, and the exporters all read from that file — never re-type the list elsewhere.

## Render states (shown in the UI and in every export's legend)

| valueStatus | Label | Meaning |
| --- | --- | --- |
| `verified` | Verified | Stated by at least one primary source |
| `reported` | Reported | Stated by secondary/contextual sources only, or deal is rumored |
| `estimate` | Estimate | Source labels it as an estimate, projection, or consensus |
| `conflicting` | Conflicting sources | Sources disagree on the same metric; all values shown |
| `not_publicly_disclosed` | Not publicly disclosed | A source says it is undisclosed, or the item is confidential by nature and unsourced |
| `not_found` | Not available from reviewed sources | Not located in the reviewed sources |

Claims are additionally marked `Fact` or `Analysis`. Analysis carries the label `Analysis — not investment advice` and lists the facts it relies on.

## Field rule codes

- **S** — Sourced only: must come from a cited source; never computed or inferred.
- **C** — Computable: may be computed in code from sourced, period-compatible inputs (DATA_AND_RESEARCH §7); show formula and inputs on hover.
- **A** — Analysis: synthesized from cited facts; labeled Analysis; requires reasoning.
- **D** — Default-undisclosed: show `Not publicly disclosed` unless a source states it.
- **M** — Market data: requires `asOf`; sourced only in v1 (no market-data feed).

## Quick preview → deep template mapping

| Preview element | Deep template destination |
| --- | --- |
| Headline, background | `snapshot.deal`, `snapshot.briefSummary` |
| Value and consideration | `snapshot.price`, `mechanics.cashStockMix`, `mechanics.multiplesAtAnnouncement` |
| Advisers | `snapshot.buySideBanks`, `snapshot.sellSideBanks`, `mechanics.advisersAndFees` |
| Timeline and status | `mechanics.announcement`, `mechanics.closingDate` |
| Differentiators, trends, drivers | `snapshot.buyerRationale`, `snapshot.sellerRationale`, `rationale.*` |

Quick-preview facts are carried forward into the deep report only after re-verification against the deep source pack.

## Deep-research report order

### 1. Deal snapshot — `snapshot`

| Key | Label | Rule | Notes |
| --- | --- | --- | --- |
| `deal` | Deal | S | "{Buyer} to acquire {Target}" + transaction status |
| `briefSummary` | Brief Summary | S/A | 2–3 sentences; facts cited, any framing marked Analysis |
| `price` | Price | S | Must state basis: equity purchase price, transaction EV, or other; currency |
| `premium` | Premium | C/M | One-day, 30-day, and to unaffected price; each with the reference date |
| `ebitdaMultiple` | EBITDA multiple | S/C | State LTM vs forward and the source of EBITDA |
| `transactionComps` | Transaction comps | S | Only comps named in a fairness opinion, company materials, or reputable media; cite each |
| `buySideBanks` | Buy-side banks | S | Financial advisers to the buyer; legal advisers listed separately |
| `sellSideBanks` | Sell-side banks | S | Financial advisers to target/seller; legal advisers listed separately |
| `buyerRationale` | Buyer rationale | S | As stated by buyer or sourced reporting |
| `sellerRationale` | Seller rationale | S/A | As stated or sourced; analysis marked |
| `analystView` | Analyst view on price | A | Replaces "Opinion". Weighs cited evidence (premium, multiples vs cited comps, fairness-opinion ranges). If evidence is insufficient, output exactly "Insufficient evidence to assess." Never advice. |
| `talkingPoints` | Coffee-chat talking points | A | 3 short points tied to cited facts: what's distinctive, which trend it illustrates, one smart question to ask |

### 2. Company overview — `companies`

Side-by-side Buyer and Target columns (add a Seller column for carve-outs). Each cell is a FactValue.

| Key | Label | Rule | Notes |
| --- | --- | --- | --- |
| `business` | Business | S | One sentence |
| `ceo` | CEO | S | As of the latest source; include date |
| `marketCapOrEv` | Market Cap / Enterprise Value | M | With `asOf`; private companies → `not_publicly_disclosed` unless sourced |
| `revenueTtm` | Revenue (TTM or latest FY) | S | Label the period exactly as the source does |
| `ebitdaMargin` | EBITDA / Margin | S/C | Margin computed only when EBITDA and revenue share a period; note if adjusted |
| `headquarters` | Headquarters | S | |
| `earnings` | Earnings / EPS | S | **Rolling three fiscal years ending with the current fiscal year** (computed from `today`), using each company's own fiscal-year labels. Rows: Basic, Diluted, Diluted excl. extraordinary items when available. Mark each value Actual or Estimate. If buyer and target fiscal years differ, show a note and do not align them in one row. |

### 3. Deal summary and mechanics — `mechanics`

| Key | Label | Rule | Notes |
| --- | --- | --- | --- |
| `dealType` | Type of Deal | S | Merger, acquisition, tender offer, take-private, carve-out, asset purchase, etc. |
| `announcement` | Announcement Date and Market Reaction | S/M | Date verified; reaction only if a source reports it, with `asOf` |
| `exchangeRatio` | Exchange Ratio | S | Only for stock consideration; else "Not applicable (all-cash)" |
| `cashStockMix` | Cash / Stock Mix | S | Per-share and aggregate if stated |
| `postDealStructure` | Post-deal Structure | S | Ownership split, board, brand/operating structure |
| `multiplesAtAnnouncement` | Multiples at announcement | S/C | Sub-rows: Equity Purchase Price, Transaction EV, EV/Revenue, EV/EBITDA, EV/EBIT, Equity Value/Revenue, Equity Value/Net Income |
| `closingDate` | Closing Date | S | Actual (closed) or expected (pending), labeled which |
| `multiplesAtClose` | Multiples at close | S/C | Only if materially different (>5%) from announcement; else "No material change reported" |
| `premiumPaid` | Premium Paid | C/M | One-day, 30-day, unaffected — same data as `snapshot.premium`, full detail here |
| `debtAssumed` | Debt Assumed | S | Include financing commitments if sourced |
| `competitors` | Competitors (Buyer / Target) | S | From company filings or reputable sources; cite |
| `accretionDilution` | Dilution / Accretion | S | Only as stated by the company or analysts cited; never computed |
| `advisersAndFees` | Financial Advisors and fees | S/D | Advisers per side; fees `Not publicly disclosed` unless a proxy/filing states them; note fairness-opinion providers |

### 4. Rationale and judgment — `rationale`

| Key | Label | Rule | Notes |
| --- | --- | --- | --- |
| `acquirerRationale` | Acquirer rationale | S | |
| `targetRationale` | Target rationale | S/A | |
| `synergies` | Synergies (Revenue / Cost) | S/D | Figures only if stated; else `Not publicly disclosed`; include timing if stated |
| `risks` | Risks | S/A | Categories: execution, regulatory, financing, integration, labor, customer concentration, other. Cite company risk factors where available. |
| `priceReasonableness` | Is the Price Reasonable? | A | Evidence table: fairness-opinion methods/ranges (from proxy), cited precedents, cited public comps. **No DCF performed by the app.** Limitations box shown prominently. If evidence is thin: "Insufficient evidence to assess." |
| `relatedTransactions` | Other Related Transactions | S | Cited only |

### 5. Sources and research gaps — `sources`

- Consolidated source list: publisher, title, date, source type, accessed date; clickable.
- Claim-level citation badges in every section link to entries here.
- `Open questions / missing data`.
- Research timestamp, report version, provider and model, prompt version.

## Notebook behavior

- Every rendered report block has a stable `blockId` = `{sectionKey}.{fieldKey}.{claimId|"value"}` within a version.
- A note saved from the report keeps `blockId`, `templateSection`, covered source IDs, and `reportVersionId`.
- A manual note can optionally be assigned a `templateSection`; unassigned notes export under "General notes".

## Export layout (per saved deal; DOCX primary, Markdown secondary)

Build an intermediate, format-neutral `ExportDocument` structure first (`src/server/services/export/buildExportDocument.ts`), unit-test its order and contents, then render it to DOCX and Markdown.

1. Title: deal name; subtitle: export date, report version, `Demo data` label if applicable
2. Render-state legend (table above, short form)
3. Sections 1–4 in template order; each value shows its status label; citations as numbered footnote-style references `[n]` that map to the Sources list
4. **Nikita's Notebook** — notes grouped by template section in template order, then "General notes"; for each: quoted passage (if any) with its source link(s), then her comment; pinned notes first within each group
5. Sources and research gaps (sources list, open questions, research metadata)

Fields with no value print their status label (`Not publicly disclosed` / `Not available from reviewed sources`), never a blank and never a guessed value.
