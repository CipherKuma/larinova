# Larinova Environment

This repo has three deployable apps that share one Supabase project:

| App | Directory | Vercel project | Supabase project ref |
| --- | --- | --- | --- |
| Doctor app | `app/` | `larinova-app` | `afitpprgfsidrnrrhvzs` |
| Marketing site | `landing/` | `landing` | `afitpprgfsidrnrrhvzs` |
| Patient portal | `patient-portal/` | `larinova-patient` | `afitpprgfsidrnrrhvzs` |

Canonical Supabase URL:

```text
https://afitpprgfsidrnrrhvzs.supabase.co
```

Environment rules:

- All three apps must use the same `NEXT_PUBLIC_SUPABASE_URL`.
- Server-side Supabase access must use the matching `SUPABASE_SERVICE_ROLE_KEY` for `afitpprgfsidrnrrhvzs`.
- Do not use `vziyntciabkelnaujliq` for Larinova app data. It does not contain the Larinova tables.
- After vault injection, verify the project ref before running scripts that mutate data.

Quick verification:

```bash
cd /Users/gabrielantonyxaviour/Documents/products/larinova
node scripts/verify-supabase-env.mjs
```

The script must print `OK` for every local app env and Vercel project link.
