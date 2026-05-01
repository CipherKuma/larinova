# Patient Portal — Deployment Runbook

The code is complete and verified locally (`pnpm typecheck` ✅, `pnpm test` ✅,
`pnpm build` ✅). The only remaining step is Vercel + DNS, which the teammate
agent couldn't run because the `vercel` CLI is not authenticated in the cmux
environment.

## One-time: authenticate & link

Run these commands yourself (or from a shell with Vercel auth):

```bash
cd ~/Documents/products/larinova/patient-portal

# 1. Authenticate (interactive browser login) — only needed once per machine
vercel login

# 2. Switch to the CipherKuma team
vercel switch
# pick "CipherKuma"

# 3. Link this directory to the existing Vercel project named `larinova-patient`
vercel link --yes --project larinova-patient
```

## Environment variables

Add these to the new Vercel project (Production + Preview + Development):

```
NEXT_PUBLIC_SUPABASE_URL          (same as main app — pull from vault)
NEXT_PUBLIC_SUPABASE_ANON_KEY     (same as main app)
SUPABASE_SERVICE_ROLE_KEY         (same as main app — server-only)
NEXT_PUBLIC_APP_URL=https://patient.larinova.com
NEXT_PUBLIC_MAIN_APP_URL=https://app.larinova.com
```

Quickest path using our vault:

```bash
~/.claude/vault/inject.sh get \
  NEXT_PUBLIC_SUPABASE_URL_LARINOVA NEXT_PUBLIC_SUPABASE_ANON_KEY_LARINOVA SUPABASE_SERVICE_ROLE_KEY_LARINOVA \
  --dir ~/Documents/products/larinova/patient-portal

# Then map those values to the app's expected variable names and push them into Vercel:
cd ~/Documents/products/larinova/patient-portal
printf '%s' "$(grep '^NEXT_PUBLIC_SUPABASE_URL_LARINOVA=' .env.local | cut -d= -f2-)" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf '%s' "$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY_LARINOVA=' .env.local | cut -d= -f2-)" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
printf '%s' "$(grep '^SUPABASE_SERVICE_ROLE_KEY_LARINOVA=' .env.local | cut -d= -f2-)" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

printf 'https://patient.larinova.com' | vercel env add NEXT_PUBLIC_APP_URL production
printf 'https://app.larinova.com'     | vercel env add NEXT_PUBLIC_MAIN_APP_URL production
```

## Deploy

```bash
cd ~/Documents/products/larinova/patient-portal
vercel --prod
```

## DNS

Add a CNAME record at your DNS provider:

| Name      | Type  | Value                    | TTL  |
|-----------|-------|--------------------------|------|
| `patient` | CNAME | `cname.vercel-dns.com`   | 300  |

Then in Vercel project settings → Domains → add `patient.larinova.com` and
`www.patient.larinova.com` (if you want the www redirect). Vercel will auto-
issue the SSL cert within a minute.

## Post-deploy verification

```bash
# 1. Hitting root should 307 to /login (no cookies)
curl -sI https://patient.larinova.com/ | grep -iE 'location|HTTP/'

# 2. /login should render
curl -s https://patient.larinova.com/login | grep -i "magic link"
```

Use `playwright-cli-sessions` for the full auth loop:

```bash
npx playwright-cli-sessions@latest screenshot \
  https://patient.larinova.com/login \
  --out=/tmp/patient-portal-login.png \
  --wait-for='input[type="email"]'
```

## CORS on main app

The portal's client code calls:

- `POST ${NEXT_PUBLIC_MAIN_APP_URL}/api/intake-submissions`
- `POST ${NEXT_PUBLIC_MAIN_APP_URL}/api/appointments/:id/cancel`
- `GET  ${NEXT_PUBLIC_MAIN_APP_URL}/api/prescriptions/:id/pdf` (fallback)

The main app must respond with:

```
Access-Control-Allow-Origin: https://patient.larinova.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: content-type, authorization
```

This is owned by the main app team, not patient-portal.
