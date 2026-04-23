#!/usr/bin/env npx tsx
/**
 * WhatsApp QR pairing — only needed as a fallback.
 *
 * By default `send.ts` / `list.ts` reuse Marty's already-paired session at
 * ~/Documents/agents/marty/data/whatsapp-auth/ (see config.ts). Run this
 * script only if that session is lost/unpaired, OR if you want to create
 * an isolated larinova-ops session. To isolate, run with:
 *
 *   WHATSAPP_AUTH_DIR=./data/whatsapp-auth \
 *   WHATSAPP_CLIENT_ID=larinova-ops \
 *   npm run pair
 *
 * On your phone: WhatsApp → Settings → Linked Devices → Link a Device → scan QR.
 */

import { mkdirSync } from "fs";
import { AUTH_DIR, CLIENT_ID, PUPPETEER_OPTS } from "./config";

mkdirSync(AUTH_DIR, { recursive: true });

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  WhatsApp pairing");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  Auth dir:  ${AUTH_DIR}`);
console.log(`  Client ID: ${CLIENT_ID}`);
console.log("");

const wwebjs: any = await import("whatsapp-web.js");
const { Client, LocalAuth } = wwebjs.default ?? wwebjs;
const qrcode: any = await import("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: CLIENT_ID, dataPath: AUTH_DIR }),
  puppeteer: PUPPETEER_OPTS,
});

let qrShown = 0;

client.on("qr", (qr: string) => {
  qrShown++;
  process.stdout.write("\x1b[2J\x1b[H");
  console.log(`  QR attempt ${qrShown} — scan within ~30s`);
  console.log("");
  (qrcode.default ?? qrcode).generate(qr, { small: true });
  console.log("  ^^ WhatsApp → Settings → Linked Devices → Link a Device");
  console.log("");
});

client.on("authenticated", () => {
  console.log("\n  Authenticated. Finalizing...");
});

client.on("auth_failure", (msg: string) => {
  console.error(`\n  Auth failure: ${msg}`);
  process.exit(1);
});

client.on("ready", async () => {
  const info = client.info;
  console.log("\n  READY. Session saved.");
  console.log(`  Phone: ${info?.wid?._serialized ?? "?"}`);
  console.log(`  Name:  ${info?.pushname ?? "?"}`);
  console.log("");
  console.log("  Next: npm run list  (to see your chats)");
  console.log('        npm run send -- --to=<jid> --text="hello"');

  setTimeout(async () => {
    try {
      await client.destroy();
    } catch {}
    process.exit(0);
  }, 3000);
});

client.on("disconnected", (reason: string) => {
  console.error(`\n  Disconnected: ${reason}`);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("\n  Cancelled.");
  try {
    await client.destroy();
  } catch {}
  process.exit(0);
});

client.initialize();
console.log(
  "  Booting whatsapp-web.js (first run downloads Chromium; 30–60s)...",
);
console.log("");
