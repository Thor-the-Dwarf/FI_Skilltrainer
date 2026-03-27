---
name: quizmaster-finish-notify
description: Use when working on quiz database batches in this workspace and the workflow requires notifying QuizMaster (019d2ae2-8525-7792-a341-161adc031e73) before any user-facing completion message.
---

# QuizMaster Completion Protocol

Use this workflow for quiz-batch work in this repository.

1. Finish the batch and run the database quality checks.
2. Before sending any final user message, notify `019d2ae2-8525-7792-a341-161adc031e73` that the batch is complete.
3. Include the database path, total question count, newly added question count, and the key quality signals in that message.
4. Wait briefly for feedback from QuizMaster.
5. If feedback arrives in time, incorporate it before the user-facing closeout.
6. If no feedback arrives in the wait window, state that QuizMaster was notified and that no response arrived yet.

For quiz database expansion work, keep batches at exactly 100 new questions unless the user explicitly changes the batch size.
The long-term repository target is 1000 tasks per quiz database.
