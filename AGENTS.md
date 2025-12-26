## Documentation Lookup

When documentation lookup is required:
- The agent should use Context7 as the primary source of truth.
- Do not rely on assumptions if documentation can be retrieved via Context7.

## Progress Update Rules

The project progress is tracked in:
- `/docs/1management/plan.md`

When the user explicitly states that a task or step is completed (e.g. “当前任务完成”, “这一步做完了”, “可以更新进度了”):

The agent MUST:
1. Identify the corresponding step or module in `plan.md`.
2. Update the completion status or percentage of that specific step.
3. Recalculate and update the overall progress to reflect this change.
4. Keep all other progress entries unchanged.

The agent MUST NOT:
- Update progress proactively without explicit confirmation from the user.
- Guess completion status or infer progress implicitly.
- Modify unrelated sections in `plan.md`.

If the mapping between the completed task and `plan.md` is ambiguous:
- Ask for clarification before making any changes.
