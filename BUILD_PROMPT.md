# The one prompt

Paste this once. If the session ends before the build is finished (context limit, crash, you closed it), start a new session and paste the **same prompt** again; it resumes from `PROGRESS.md`.

```text
Build Deal Desk end to end, autonomously, following AGENTS.md and docs/BUILD\_PLAN.md (milestones M0–M6), using docs/PRODUCT\_SPEC.md, docs/DATA\_AND\_RESEARCH.md, and docs/TEMPLATE\_MAPPING.md as the source of truth.

If PROGRESS.md exists, read it and resume from the first milestone not marked Done. Otherwise start at M0.

Do not stop between milestones and do not ask me questions: resolve ambiguity with the simplest choice consistent with the docs and record it under Decisions in PROGRESS.md. After each milestone, run the full gate, fix failures at the root cause (never by skipping or weakening tests), update PROGRESS.md, and commit. No API keys are available; everything must work in demo mode, and live providers are verified with recorded-response tests.

Stop only when M6 is complete, or if you are blocked by something only I can provide. When you stop, give me: what was built, the exact commands to run and test it with their latest results, and everything listed under Deferred and Known issues.
```

