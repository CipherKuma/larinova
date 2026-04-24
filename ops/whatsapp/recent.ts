#!/usr/bin/env npx tsx
/**
 * Dump raw recent messages across all chats active in the past N days.
 * Output is a JSON array — one entry per chat — meant for LLM reasoning,
 * not keyword filtering.
 *
 * Usage:
 *   npm run recent                       (default: 3 days, last 2 msgs per chat)
 *   npm run recent -- --days=7
 *   npm run recent -- --per-chat=5
 *   npm run recent -- --out=/tmp/wa.json
 */

import { writeFileSync } from "fs";
import { AUTH_DIR, CLIENT_ID, PUPPETEER_OPTS } from "./config";

type Args = Record<string, string | boolean>;
const args: Args = {};
for (const raw of process.argv.slice(2)) {
  if (!raw.startsWith("--")) continue;
  const eq = raw.indexOf("=");
  if (eq === -1) args[raw.slice(2)] = true;
  else args[raw.slice(2, eq)] = raw.slice(eq + 1);
}

const windowDays = Number(args.days ?? 3);
const perChat = Number(args["per-chat"] ?? 2);
const outPath = (args.out as string | undefined) ?? "";

const cutoff = Math.floor(Date.now() / 1000) - windowDays * 24 * 60 * 60;

const wwebjs: any = await import("whatsapp-web.js");
const { Client, LocalAuth } = wwebjs.default ?? wwebjs;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: CLIENT_ID, dataPath: AUTH_DIR }),
  puppeteer: PUPPETEER_OPTS,
});

client.on("qr", () => {
  console.error(
    `Session invalid at ${AUTH_DIR} (clientId=${CLIENT_ID}). Run npm run pair or check Marty's session.`,
  );
  process.exit(1);
});

type ChatDump = {
  chatName: string;
  chatJid: string;
  isGroup: boolean;
  unreadCount: number;
  lastActivityIso: string;
  messages: {
    fromMe: boolean;
    author: string;
    dateIso: string;
    type: string;
    body: string;
    hasMedia: boolean;
  }[];
};

client.on("ready", async () => {
  try {
    const chats = await client.getChats();
    const active = chats
      .filter((c: any) => (c.timestamp ?? 0) >= cutoff)
      .sort((a: any, b: any) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

    console.error(
      `[recent] ${active.length} chats active in last ${windowDays}d, fetching last ${perChat} msgs each`,
    );

    const out: ChatDump[] = [];
    let i = 0;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const fetchWithRetry = async (chat: any, attempts = 3): Promise<any[]> => {
      for (let a = 0; a < attempts; a++) {
        try {
          const hydrated = await client.getChatById(chat.id._serialized);
          return await hydrated.fetchMessages({ limit: perChat });
        } catch (err) {
          if (a === attempts - 1) throw err;
          await sleep(500 * (a + 1));
        }
      }
      return [];
    };
    for (const chat of active) {
      i++;
      if (i % 10 === 0) console.error(`[recent] ${i}/${active.length} ...`);
      try {
        const messages = await fetchWithRetry(chat);
        await sleep(150);
        out.push({
          chatName: chat.name ?? "(unnamed)",
          chatJid: String(chat.id._serialized),
          isGroup: !!chat.isGroup,
          unreadCount: chat.unreadCount ?? 0,
          lastActivityIso: new Date((chat.timestamp ?? 0) * 1000).toISOString(),
          messages: messages.map((m: any) => ({
            fromMe: !!m.fromMe,
            author: m.author ?? m.from ?? "",
            dateIso: new Date((m.timestamp ?? 0) * 1000).toISOString(),
            type: m.type ?? "unknown",
            body: String(m.body ?? ""),
            hasMedia: !!m.hasMedia,
          })),
        });
      } catch (err) {
        out.push({
          chatName: chat.name ?? "(unnamed)",
          chatJid: String(chat.id._serialized),
          isGroup: !!chat.isGroup,
          unreadCount: chat.unreadCount ?? 0,
          lastActivityIso: new Date((chat.timestamp ?? 0) * 1000).toISOString(),
          messages: [
            {
              fromMe: false,
              author: "",
              dateIso: "",
              type: "error",
              body: `[fetch failed: ${(err as Error).message}]`,
              hasMedia: false,
            },
          ],
        });
      }
    }

    const json = JSON.stringify(out, null, 2);
    if (outPath) {
      writeFileSync(outPath, json);
      console.error(`[recent] wrote ${out.length} chats to ${outPath}`);
    } else {
      console.log(json);
    }
  } catch (err) {
    console.error(`Failed: ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    setTimeout(async () => {
      try {
        await client.destroy();
      } catch {}
      process.exit(process.exitCode ?? 0);
    }, 1500);
  }
});

client.initialize();
