# App Directory Cleanup Audit

## Goal

Audit `app/` for generated trash, stale local artifacts, and suspicious dirty state without destroying active Bala fixes or unrelated user work.

## Decided

- Removed only ignored/generated local artifacts such as `.DS_Store`, build caches, test reports, and Playwright local data.
- Treated source changes as active work unless proven accidental.
- Preserved Bala workstreams and unrelated dirty files.
- Removed production `console.log` statements from app source paths.

## Out of scope

- Reverting or rewriting active feature fixes.
- Deleting local project config needed by Vercel.
- Cleaning outside `app/`.

## Done

- Ignored generated artifacts were removed.
- Remaining `app/` dirty source files were classified.
- `pnpm build` passed after cleanup.
- Focused appointment schedule unit and E2E checks passed after the Playwright web server port fix.
