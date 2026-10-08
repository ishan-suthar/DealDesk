# Deal Desk — Build Package

Build package for Nikita's investment-banking coffee-chat preparation tool, focused initially on Consumer & Retail M&A.

## What's in here

| File | Where it goes in the repo | Purpose |
| --- | --- | --- |
| `AGENTS.md` | repo root | Always-on rules Antigravity loads every turn: fixed stack, gates, data-integrity and security rules, exact UI copy |
| `docs/PRODUCT_SPEC.md` | `docs/` | Screens, flows, state machine, filter semantics, system states, ranking, acceptance criteria |
| `docs/DATA_AND_RESEARCH.md` | `docs/` | Types, pipeline, provenance-based verification, provider adapters, budgets, jobs, demo fixtures |
| `docs/TEMPLATE_MAPPING.md` | `docs/` | Deep-report fields with per-field sourcing/compute rules, notebook anchors, export layout |
| `docs/BUILD_PLAN.md` | `docs/` | Milestones M0–M6 the agent works through on its own |
| `BUILD_PROMPT.md` | keep beside you | The single prompt you paste (re-paste the same one to resume) |
| `CHANGES.md` | keep beside you | What was changed from the first draft and why |

## How to run the build

1. Create an empty folder, run `git init`, and copy in `AGENTS.md` (root) and the `docs/` folder.
2. In `~/.gemini/antigravity-cli/settings.json`, set `"toolPermission": "proceed-in-sandbox"` so the agent isn't stopped for approval on every command. Some risky commands may still ask; approve them.
3. Run `agy` in the folder and paste the prompt from `BUILD_PROMPT.md`.
4. If the session ends before it reports M6 complete, open a new session and paste the same prompt. It resumes from `PROGRESS.md`.
5. When it finishes: `npm run dev`, open the app, and try the flow in demo mode.
6. To go live later, copy `.env.example` to `.env.local`, add your API key and `SEC_USER_AGENT`, set `RESEARCH_PROVIDER`, restart, and run `npm run live:smoke`. No prompt needed.

## Backend model configuration

```bash
# Option A — Claude (recommended default)
RESEARCH_PROVIDER=anthropic
ANTHROPIC_MODEL_FAST=claude-haiku-5-5     # discovery gather + extract
ANTHROPIC_MODEL_DEEP=claude-sonnet-5-5    # deep-research extraction (switch to haiku if quality is sufficient)

# Option B — Gemini
RESEARCH_PROVIDER=gemini
GEMINI_MODEL=<Gemini 3.8 Flash model id from Google's model docs>

SEC_USER_AGENT="Nikita <email>"           # required by SEC for EDGAR access
```

Because both sit behind the same `ResearchProvider` interface, you can switch with one env var and compare `npm run live:smoke` results on the same filters.

## Important product choices

- "Save to dashboard" is named **Save to My Deals** in the interface.
- **Hold for review** keeps a deal in the queue under "On hold", across searches.
- **I don't like this deal** moves it to a reversible Recycle Bin; nothing is hard-deleted without confirmation.
- A saved deal's deep report is generated once, cached, versioned, and refreshed only when Nikita asks.
- The server, not the model, decides what counts as sourced.
