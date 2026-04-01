Work through BUILD_BOARD.md for freemi.ai.
Rules:
- Execute only one bounded implementation step per run.
- After the step, run an audit: frontend build, functions build if touched, and quick route/runtime sanity where possible.
- Update BUILD_BOARD.md with what was done, blockers, and next task.
- If blocked, mark blocker and move to the next task next run.
- Skip Stripe. Focus on full Base44 -> Firebase cutover and direct OpenClaw provisioning on Fly.io.
- Prefer modifying the active wizard/dashboard path first.
