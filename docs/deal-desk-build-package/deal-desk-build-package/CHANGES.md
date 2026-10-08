# Review Findings and Changes

The original package had a strong product vision and unusually good instincts about sourcing. The weaknesses were mostly places where a fast coding model would have to guess — and guessing is where builds fail or data gets invented. Findings are ordered by how likely they were to cause a failure.

## Critical (would likely have caused a failed build or fabricated data)

**1. One giant prompt for a Flash-class builder.** A single superprompt asking for an entire full-stack app invites partial implementations reported as complete. → Replaced with one short prompt (`BUILD_PROMPT.md`) that drives a milestone checklist (`docs/BUILD_PLAN.md`, M0–M6). The agent self-gates each milestone (typecheck, lint, tests, build, E2E), commits, and continues; the same prompt resumes the build from `PROGRESS.md` if a session ends. Rules moved into `AGENTS.md`, which Antigravity loads automatically, so each phase prompt stays short.

**2. No search or data provider was specified.** "A search/news API plus an LLM with browsing" leaves the agent to pick or stub one. → Specified Anthropic (web search + web fetch) and Gemini (Search grounding + URL context) adapters plus an SEC EDGAR client for primary sources, all behind one interface.

**3. Citations were asked for but not enforced.** Models can produce plausible URLs and numbers that no source contains. → Added provenance-based verification: the server builds a numbered source pack from what it actually retrieved, the model may cite only those IDs, numbers must be found in the cited text, and "verified" requires a primary source. Failing claims are downgraded, not shown.

**4. No market-data source, yet the template asks for market cap, premiums, share-price reaction, EPS.** The model would have filled these from memory. → v1 has no market-data feed; those fields are sourced-only with an `asOf` date, else "Not available from reviewed sources". Calculations are allowed only from sourced, period-compatible inputs, with the formula shown.

**5. Demo fixtures allowed "licensed/public, clearly dated examples".** A coding model would write real deals with invented details. → Fixtures are fictional only, with an exact list of 10 deals and URLs under `https://example.com/demo/`, plus a recovery prompt and test to catch violations.

**6. No current-date handling.** "Last 90 days" depends on today's date; models have training cutoffs. → The server injects `today` into every prompt and checks announcement dates against the window in code.

## High (inconsistencies the builder would resolve differently each time)

**7. Three different status vocabularies.** `valueStatus` (confirmed/reported/…), the template's render states (verified value/reported value/…), and a combined `DealStatus` that mixed workflow with transaction status. → One `ValueStatus` enum with fixed UI labels; transaction status and user status are separate fields.

**8. No user-status state machine.** What happens to a saved deal you no longer want? Where does a restored item go if its search queue is gone? → Explicit transition table, including `Remove from My Deals`, `statusBeforeDelete`, and queue groups (On hold / Restored / Current results) that survive new searches.

**9. Undefined types.** `QuickPreview`, `ResearchReport`, company/adviser entities, search runs, and jobs were referenced but never defined; `Note` lacked a template section and an ordering field. → All defined.

**10. Filter semantics.** "Announced" vs "Pending" overlapped; "U.S." didn't say whose headquarters; "number of deals" didn't say whether to pad. → Status options are Pending / Closed / Terminated / Any with a separate "Include rumored" checkbox; geography matches the target's HQ; the count is a maximum and the UI says when fewer met the evidence bar.

**11. Ranking by the model.** "Transparent score" is only transparent if code computes it. → Each factor has a concrete formula; the model only extracts the features. "Consumer/Retail relevance" became "sector/subsector relevance" so other sectors rank correctly.

**12. Stack left open.** "Next.js or existing stack", "Prisma/Drizzle", "Tailwind or equivalent". → Pinned: Next.js App Router, SQLite + Drizzle, Zod, Vitest, Playwright, `docx`, Radix/Tailwind.

## Template-specific changes

- **Hard-coded 2024/2025/2026 earnings** → rolling three fiscal years ending with the current one, using each company's own FY labels, marked Actual/Estimate.
- **"Opinion" and "Is the Price Reasonable?"** sat uneasily with "never financial advice". → Renamed `Analyst view on price`, built only from cited evidence, with the exact fallback "Insufficient evidence to assess."
- **DCF and accretion/dilution** removed as things the app computes; shown only if a company or fairness opinion states them.
- **Transaction comps** limited to comps named in a cited source.
- **Adviser fees** noted as often disclosed in merger proxies for public targets, so the pipeline looks there before defaulting to "Not publicly disclosed".
- Added a **Coffee-chat talking points** field (analysis-labeled) to section 1, since a 15-minute brief is the stated goal.
- Each field now has a rule code (Sourced / Computable / Analysis / Default-undisclosed / Market data) so extraction prompts and validation are generated from one definition.

## Reliability additions

- Two-step research (gather, then tool-free extraction against the source pack), section-by-section for deep reports, which also keeps prompts short.
- Budgets per run, a daily search cap, timeouts, retries only on transient errors, usage logged per job.
- Persistent job table with heartbeats and recovery after restarts; one job per deal at a time; simple polling.
- Treat fetched web content as untrusted (prompt-injection defense).
- A test-only failing provider so partial-failure, budget-reached, and zero-result states are tested, not just designed.
- A format-neutral export model tested before rendering to DOCX/Markdown.
- Keyboard alternative to text selection for saving notes.
- Acceptance criteria are numbered and each maps to a named test.

## Scope trimmed for v1

PDF export, dark mode, and a licensed market-data feed are deferred and listed as such.
