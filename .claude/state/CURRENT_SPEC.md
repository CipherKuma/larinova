# Current Spec

## Goal
Audit and improve production performance for `app.larinova.com` starting 2026-05-01, covering every reachable app page, API route timing, and browser route fluidity.

## Decided
- Measure before changing code: route inventory, live production page loads, browser navigation timings, and API timing samples.
- Prioritize visible user latency in the protected doctor app before micro-optimizing isolated code.
- Use existing Larinova performance learnings as a map, but remeasure current production because timings and deployments can drift.
- Keep unrelated dirty worktree changes out of any performance patch.

## Open
- Which protected routes are reachable with the currently saved production session.
- Which API routes can be safely sampled as GET/HEAD without mutating production data.
- Whether the worst latency is network, auth/proxy, database, route render, client bundle, or global provider work.

## Out of scope
- Do not run mutating production API requests just to benchmark them.
- Do not change product behavior, copy, or UI unless required to remove measured latency.
- Do not deploy without build/test checks and live verification.

## Done-when
- Page and API inventories are documented with timing evidence.
- The slowest reproducible paths have root causes identified and focused fixes applied where safe.
- Local regression checks pass for affected code.
- Production is verified after deployment with representative page and API timing samples.
