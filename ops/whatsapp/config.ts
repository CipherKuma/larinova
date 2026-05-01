/**
 * Shared WhatsApp client config for larinova-ops scripts.
 *
 * Defaults to reusing Marty's already-paired session at
 * ~/Documents/agents/marty/data/whatsapp-auth/ (clientId: "marty").
 * No QR pairing needed — just make sure Marty isn't running
 * simultaneously (whatsapp-web.js allows one live process per session).
 *
 * Override via env vars if you want an isolated session:
 *   WHATSAPP_AUTH_DIR=/path/to/auth/parent
 *   WHATSAPP_CLIENT_ID=larinova-ops
 */

import { homedir } from "os";
import { resolve } from "path";

export const AUTH_DIR =
  process.env.WHATSAPP_AUTH_DIR ??
  resolve(homedir(), "Documents/agents/marty/data/whatsapp-auth");

export const CLIENT_ID = process.env.WHATSAPP_CLIENT_ID ?? "marty";

export const USER_AGENT =
  process.env.WHATSAPP_USER_AGENT ??
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";

export const PUPPETEER_OPTS = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};
