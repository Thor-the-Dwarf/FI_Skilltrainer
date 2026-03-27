---
name: quizmaster-handoff
description: Use when quiz databases are extended in 100-question packages and Codex must notify the QuizMaster reviewer `019d2ae2-8525-7792-a341-161adc031e73` before replying to the user, apply feedback, fetch the next package assignment immediately, and continue without idle time.
---

# QuizMaster Handoff

Use this workflow for quiz-database package work such as PV1, PV2, PV3, LF12 or similar SQLite quiz imports.

## Workflow

1. Work only in the quiz database requested by the user.
2. Increase the package in steps of 100 questions.
3. Rebuild the target database and run the usual quality checks:
   - no empty option texts
   - no visible ticket/version/file remnants
   - no prompt/context duplication
   - clean `concept_id` and `variant_id` handling
   - `badge_label` filled, `is_new = 0`
4. Before replying to the user, notify the QuizMaster reviewer `019d2ae2-8525-7792-a341-161adc031e73`.
5. Use a delegated agent for the review loop when available. Include:
   - target database path
   - new total question count
   - package delta, for example “next 100”
   - relevant importer/script path
   - the most important validation results
6. Wait for feedback, implement it, then notify the QuizMaster again.
7. Repeat until the QuizMaster explicitly signals satisfaction or no further actionable findings remain.
8. After satisfaction, ask the QuizMaster for the concrete follow-up order for the same workstream instead of stopping at the user handoff.
9. If the QuizMaster gives a concrete next package order and no new blocker exists, continue working on that order immediately.
10. If the current database is still below `1000` questions, immediately ask the QuizMaster for the next concrete `+100` package in the same database.
11. Continue with that next package without waiting for an extra user prompt.
12. Only when the current database reaches `1000` questions should you ask the QuizMaster for reassignment to a different database.
13. Only send the user update after the current review loop and the current package decision are both complete.

## Notes

- Prefer deterministic import scripts over manual SQLite edits.
- Keep package progress additive: the next run should raise the total by another 100 when source material allows it.
- If the current source material cannot realistically reach the requested target, say so clearly after the review loop.
- Treat your current database assignment as sticky: do not switch away just because other agents also report progress.
- Silent waiting is a workflow failure. After every accepted package, the next package assignment must be requested immediately.
