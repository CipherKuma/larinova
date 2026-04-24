#!/usr/bin/env npx tsx
/**
 * Scan recent WhatsApp messages for keyword matches across chats.
 *
 * Usage:
 *   npm run read                          (default: invest/funding keywords, last 50 msgs per chat, 60-day window)
 *   npm run read -- --days=30
 *   npm run read -- --per-chat=100
 *   npm run read -- --keywords="invest,angel,vc"
 *   npm run read -- --chats=20            (scan top 20 most-recent chats only)
 *   npm run read -- --json                (JSON output)
 */

import { AUTH_DIR, CLIENT_ID, PUPPETEER_OPTS } from "./config";

type Args = Record<string, string | boolean>;
const args: Args = {};
for (const raw of process.argv.slice(2)) {
  if (!raw.startsWith("--")) continue;
  const eq = raw.indexOf("=");
  if (eq === -1) args[raw.slice(2)] = true;
  else args[raw.slice(2, eq)] = raw.slice(eq + 1);
}

const perChat = Number(args["per-chat"] ?? 50);
const windowDays = Number(args.days ?? 60);
const chatLimit = args.chats ? Number(args.chats) : Infinity;
const asJson = args.json === true;

const DEFAULT_KEYWORDS = [
  "invest",
  "investor",
  "investing",
  "investment",
  "fund",
  "funding",
  "funded",
  "vc",
  "venture",
  "venture capital",
  "angel",
  "seed",
  "pre-seed",
  "pre seed",
  "raise",
  "raising",
  "fundraise",
  "fundraising",
  "round",
  "series a",
  "series b",
  "term sheet",
  "termsheet",
  "valuation",
  "cap table",
  "cheque",
  "check size",
  "ticket size",
  "lp ",
  "limited partner",
  "syndicate",
  "family office",
  "capital",
  "equity",
  "pitch deck",
  "deck",
  "due diligence",
  "dd call",
  "backer",
  "back you",
  "write a check",
  "write a cheque",
];

const keywords = (
  (args.keywords as string | undefined)?.split(",") ?? DEFAULT_KEYWORDS
)
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean);

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

type Hit = {
  chatName: string;
  chatJid: string;
  isGroup: boolean;
  fromMe: boolean;
  author: string;
  timestamp: number;
  dateIso: string;
  matchedKeywords: string[];
  body: string;
};

const cutoff = Math.floor(Date.now() / 1000) - windowDays * 24 * 60 * 60;

client.on("ready", async () => {
  try {
    const chats = await client.getChats();
    const hits: Hit[] = [];
    const sortedChats = chats
      .slice()
      .sort((a: any, b: any) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    const toScan = sortedChats.slice(0, chatLimit);

    console.error(
      `[read] scanning ${toScan.length} chats · per-chat=${perChat} · window=${windowDays}d · keywords=${keywords.length}`,
    );

    let i = 0;
    for (const chat of toScan) {
      i++;
      if (i % 10 === 0) console.error(`[read] ${i}/${toScan.length} ...`);
      try {
        const messages = await chat.fetchMessages({ limit: perChat });
        for (const m of messages) {
          if (!m.body) continue;
          if ((m.timestamp ?? 0) < cutoff) continue;
          const body = String(m.body).toLowerCase();
          const matched = keywords.filter((k) => body.includes(k));
          if (matched.length === 0) continue;
          hits.push({
            chatName: chat.name ?? "(unnamed)",
            chatJid: String(chat.id._serialized),
            isGroup: !!chat.isGroup,
            fromMe: !!m.fromMe,
            author: m.author ?? m.from ?? "",
            timestamp: m.timestamp ?? 0,
            dateIso: new Date((m.timestamp ?? 0) * 1000).toISOString(),
            matchedKeywords: matched,
            body: String(m.body),
          });
        }
      } catch (err) {
        console.error(
          `[read] skipped chat ${chat.name}: ${(err as Error).message}`,
        );
      }
    }

    hits.sort((a, b) => b.timestamp - a.timestamp);

    if (asJson) {
      console.log(JSON.stringify(hits, null, 2));
    } else {
      console.log("");
      console.log(
        `==== ${hits.length} matches across ${toScan.length} chats (last ${windowDays}d) ====`,
      );
      for (const h of hits) {
        const who = h.fromMe
          ? "YOU"
          : h.isGroup
            ? `${h.author || "?"} in ${h.chatName}`
            : h.chatName;
        console.log("");
        console.log(`[${h.dateIso}] ${who}  (${h.chatJid})`);
        console.log(`  matched: ${h.matchedKeywords.join(", ")}`);
        const preview = h.body.replace(/\s+/g, " ").slice(0, 500);
        console.log(`  > ${preview}${h.body.length > 500 ? " …" : ""}`);
      }
      console.log("");
      console.log(`Total: ${hits.length} matches`);
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
