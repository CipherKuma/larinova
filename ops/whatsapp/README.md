# WhatsApp CLI (larinova/ops)

Minimal `whatsapp-web.js` wrapper for sending messages from this ops project. **Reuses Marty's already-paired session by default** — no QR pairing needed.

## Quick start (reuse Marty)

```bash
cd ~/Documents/products/larinova/ops/whatsapp
npm install                      # first run only, downloads Chromium
npm run list                     # verify session is live, print your chats + JIDs
```

That's it. By default, scripts point at `~/Documents/agents/marty/data/whatsapp-auth/` with `clientId: "marty"`, so whatever device slot Marty registered is what these scripts use.

## Use

```bash
# List your chats + JIDs
npm run list
npm run list -- --groups
npm run list -- --search=xaviour

# Send text to a DM (JID format: <countrycode><number>@c.us)
npm run send -- --to=919884009228@c.us --text="hello"

# Send to a group by substring match of its name
npm run send -- --group="xaviour" --text="team update"

# Send a file
npm run send -- --to=919884009228@c.us --file=/tmp/brief.pdf --caption="Today's brief" --as-document

# Send an image (inline)
npm run send -- --to=919884009228@c.us --file=~/Desktop/photo.jpg --caption="FYI"
```

## Concurrency with Marty

`whatsapp-web.js` only allows **one live process per (dataPath, clientId) pair**. If Marty is currently running against this session, these scripts will fail to attach. Stop Marty first:

```bash
# Check if Marty is up
ps aux | grep marty | grep -v grep

# If yes, stop it before running our scripts (see clan-runtime's stop-all.sh)
```

When you're done with ops work and want to bring Marty back, just restart it. The auth state is shared, so Marty picks up right where you left off.

## Want an isolated session instead?

If you'd rather not share Marty's slot (so both can run concurrently), pair as a new linked device:

```bash
WHATSAPP_AUTH_DIR=./data/whatsapp-auth \
WHATSAPP_CLIENT_ID=larinova-ops \
npm run pair
# scan the QR from your phone
```

Then prefix all future `npm run` calls with the same two env vars, or `export` them in your shell. That uses `ops/whatsapp/data/whatsapp-auth/` (gitignored) as a separate device.

## Config

Session location is controlled by `config.ts` via env vars:

| Env var               | Default                                                    |
| --------------------- | ---------------------------------------------------------- |
| `WHATSAPP_AUTH_DIR`   | `~/Documents/agents/marty/data/whatsapp-auth`              |
| `WHATSAPP_CLIENT_ID`  | `marty`                                                    |

## Notes

- **JID format.** DMs are `<countrycode><number>@c.us` (no `+`, no spaces). Groups are `<long-id>@g.us`. `list` prints both.
- **Do NOT commit** `data/` — it holds the live auth token. Already gitignored.
- **Based on** `~/Documents/agents/clan-runtime/scripts/whatsapp-pair.ts` + `wa-multi-test.ts`.
