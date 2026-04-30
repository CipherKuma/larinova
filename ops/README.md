# larinova/ops

Non-technical subdir of the Larinova project — strategy, sales, collateral, pricing docs, and ops tooling (local Gmail MCP + WhatsApp CLI). Code lives one level up at the repo root.

See [CLAUDE.md](./CLAUDE.md) for full context and why this is a subdir.

## Quick start

```bash
# WhatsApp (one-time pairing)
cd whatsapp && npm install && npm run pair

# Build pricing strategy PDFs
cd docs && ./build.sh
```

## Directory map

- `agent-tooling/` — ops-specific agent skills and lockfiles. Do not scatter generated `.claude`, `.agents`, `.qwen`, `.roo`, `.windsurf`, or similar folders directly under `ops/`.
- `collateral/` — reusable designed assets and campaign collateral.
- `company-docs/` — durable company/legal documents. Raw imports go under `company-docs/_incoming/` until reviewed.
- `docs/` — built pricing, research, and sales documents that are meant to be shared.
- `media/` — media production workspaces such as Remotion/demo-video projects. Commit source intentionally, not `node_modules` or render outputs.
- `research/` — source research notes that are not product specs.
- `sales/` — sales evidence, pitch decks, prospect research, and meeting/customer feedback.
- `strategy/` — go-to-market, startup-program, CRM, and outreach strategy.
- `whatsapp/` — local WhatsApp automation tooling and docs.

## Gmail MCP setup (two accounts)

We run **two local Gmail MCP instances in parallel** — one for `gabrielantony56@gmail.com`, one for `gabriel@larinova.com`. Same OAuth client, separate token caches. Both are available simultaneously in any Claude Code session started inside `ops/`.

### One-time Google Cloud setup

1. Go to https://console.cloud.google.com → create or select a project (e.g. "larinova-ops").
2. **Enable the Gmail API**: APIs & Services → Library → search "Gmail API" → Enable.
3. **OAuth consent screen**: External, Testing mode. Add **both** emails as test users:
   - `gabrielantony56@gmail.com`
   - `gabriel@larinova.com`
   Scopes: add `https://www.googleapis.com/auth/gmail.modify` (read + draft + label; no raw send).
4. **Create credentials**: APIs & Services → Credentials → Create Credentials → OAuth client ID → **Desktop app**. Download the JSON.
5. Save the downloaded JSON as `./.gmail-credentials.json` in this folder (gitignored).

### Activate the two MCPs

1. In `.mcp.json`, rename:
   - `_gmail_personal_disabled` → `gmail_personal`
   - `_gmail_larinova_disabled` → `gmail_larinova`
2. Restart Claude Code **with CWD inside `ops/`**.
3. First tool call against `gmail_personal` opens a browser → sign in as `gabrielantony56@gmail.com` → consent → token caches to `.gmail-token-personal.json`.
4. First tool call against `gmail_larinova` opens a browser → sign in as `gabriel@larinova.com` → consent → token caches to `.gmail-token-larinova.json`.

Refresh tokens persist — no more "expired mid-task" surprises.

### Workspace note

`gabriel@larinova.com` is a Google Workspace account. Since you're the Workspace admin, the OAuth consent flow works the same. If Workspace has "App Access Control" restrictions, you may need to trust the OAuth client ID in admin.google.com → Security → API controls → App access control.

## How MCP isolation works

Claude Code walks **up** from the current working directory to find `.mcp.json`. That means:

- CWD in `../app/` or `../landing/` → only root `.mcp.json` (Context7) is visible. Gmail/WhatsApp **not loaded**.
- CWD in `ops/` or deeper → `ops/.mcp.json` (Gmail) is visible; root one still applies.

So keep ops sessions rooted inside `ops/`, and code sessions at the repo root.
