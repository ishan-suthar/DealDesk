# Build Plan — milestones M0–M6

Work through these in order, autonomously. After each milestone: run the gate (AGENTS.md), fix failures at the root cause, update `PROGRESS.md`, commit as `M{n}: {title}`, and continue. Resume from the first milestone not marked Done in `PROGRESS.md`.

## M0 — Plan (no app code)
- Write `PLAN.md`: file tree; Drizzle tables mapping every entity in DATA_AND_RESEARCH §3; API routes (method, path, Zod input, response, 400/404/409); job runner, polling, and provider selection; every test mapped to AC1–AC10.
- List contradictions or ambiguities in the docs and resolve each with the simplest consistent choice under Decisions in `PROGRESS.md`. Do not ask the user.
- Create `PROGRESS.md` with sections: Done, Decisions, Deferred, Known issues, Dependencies added.

## M1 — Foundation
- Scaffold Next.js (App Router, TS strict, Tailwind, ESLint), Vitest, Playwright, all npm scripts in AGENTS.md.
- `src/domain`: enums, Zod schemas, `taxonomy.ts`, `template.ts` (from TEMPLATE_MAPPING), `userStatus.ts` state machine.
- Drizzle schema, migrations, repositories, `db:migrate` / `db:seed` / `db:reset`.
- The 10 fictional fixtures (DATA_AND_RESEARCH §10), dates relative to seed time, including fixture #1's deep report v1 and 3 notes.
- Unit-tested pure services: every valid/invalid status transition, URL canonicalization + source dedupe, deal `dedupeKey`, `numberAppearsInText`, verification rules 1–8, ranking.
- `.env.example`: `RESEARCH_PROVIDER=demo`, `ANTHROPIC_API_KEY=`, `ANTHROPIC_MODEL_FAST=claude-haiku-5-5`, `ANTHROPIC_MODEL_DEEP=claude-sonnet-5-5`, `GEMINI_API_KEY=`, `GEMINI_MODEL=`, `SEC_USER_AGENT=`, `DAILY_SEARCH_CAP=300`.
- Add a unit test that fails if any fixture URL is not under `https://example.com/demo/`.

## M2 — Welcome, dashboard, discovery, quick preview, Recycle Bin
- `/`, `/settings`, `/research` (three columns; tabs below 1024 px), `/recycle-bin` per PRODUCT_SPEC §3.1–3.4, §3.7.
- Job runner (DATA_AND_RESEARCH §9) and demo provider (§8.1) running through the real pipeline and verification.
- Search controls with defaults and validation, filter chips, progress stages, incremental cards, queue groups (On hold / Restored / Current results), collapse/show.
- Quick preview with `FactValue`, citation badges, sources, the three footer buttons, toasts, undo.
- All system states in PRODUCT_SPEC §3.8 (use the `failing_test` provider). Demo data banner.
- E2E: AC1, AC2, AC3, AC4, AC7. Start the dev server and click through the flow before marking Done.

## M3 — Deep research report
- Saved deal: auto-start a job only if no report exists; else show latest with "Last researched …", `Refresh research`, version menu, cancel; prior report stays visible during refresh.
- Render strictly from `template.ts` in TEMPLATE_MAPPING order: status labels, Fact/Analysis marks, citation badges linked to Sources, open questions, metadata.
- Stable `blockId`s and a keyboard-reachable block action menu. `Remove from My Deals` in the report header.
- Demo provider produces a deterministic deep report for any saved fixture.
- Tests: AC5 (E2E + unit), AC10 (unit + component test that no fact renders without a status).

## M4 — Notebook and export
- Floating `Save to Notebook` on selection; multi-block handling; 2,000-char limit; focus to comment field.
- `/notebook`: filter by deal/section, search, manual notes, edit, delete with undo, pin, reorder (drag + Move up/Move down).
- `buildExportDocument` (format-neutral, unit-tested for order, notes grouping, legend, footnotes, missing-field labels) → DOCX (`docx`) and Markdown renderers.
- Tests: AC6 (E2E), AC8 (unit + E2E download produces a non-empty DOCX).

## M5 — Live providers (no API keys required to complete)
- EDGAR client (confirm endpoints from SEC developer docs; `SEC_USER_AGENT`; ≥150 ms spacing; retries).
- Anthropic adapter: gather with server-side web search + web fetch (current tool versions from Anthropic docs, in `config.ts`), provenance from tool-result blocks, `pause_turn` and `error_code` handling; extract as a separate tool-free call with a forced `submit_result` tool and Zod-derived JSON Schema.
- Gemini adapter: grounding + URL context gather, redirect-URI resolution, JSON-schema extract. Record the grounding-terms review in Decisions.
- Budgets, timeouts, retries, `DAILY_SEARCH_CAP`, usage per Job. Versioned prompt files per DATA_AND_RESEARCH §8.6.
- Contract tests from **recorded** responses (no network in tests). `npm run live:smoke` script for later manual use; if keys are absent it exits with a clear message. Missing keys must fall back to demo mode with a visible notice.
- Do not loosen verification to make live output look better.

## M6 — Hardening and handoff
- Accessibility: headings, labels, focus, full keyboard path search → preview → save → report → notebook.
- Responsive check at 1280, 1024, 768 px.
- Security pass per AGENTS.md; confirm no key or provider SDK is in the client bundle.
- `README.md`: setup, demo mode, adding a live key, test commands, privacy/data limits, not investment advice.
- Final report to the user: what was built, exact commands and their results, and everything under Deferred and Known issues.
