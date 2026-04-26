#!/usr/bin/env npx tsx
/**
 * Read recent messages from the RAX PMP APP - Drive group.
 * Pulls last N messages (default 40), shows sender + body + media flag.
 * Downloads any media (images/videos) to /tmp/whatsapp-media/.
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { AUTH_DIR, CLIENT_ID, PUPPETEER_OPTS } from "./config";

const GROUP_JID = "120363423081039496@g.us";
const LIMIT = parseInt(process.argv[2] ?? "40", 10);
const MEDIA_DIR = "/tmp/whatsapp-media";

mkdirSync(MEDIA_DIR, { recursive: true });

async function main() {
  const wwebjs: any = await import("whatsapp-web.js");
  const { Client, LocalAuth } = wwebjs.default ?? wwebjs;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: CLIENT_ID, dataPath: AUTH_DIR }),
    puppeteer: PUPPETEER_OPTS,
  });

  client.on("qr", () => {
    console.error(`Session invalid at ${AUTH_DIR}. Re-pair needed.`);
    process.exit(1);
  });

  client.on("ready", async () => {
    try {
      const chat = await client.getChatById(GROUP_JID);
      const messages = await chat.fetchMessages({ limit: LIMIT });
      console.log(
        `\n=== Last ${messages.length} messages in "${chat.name}" ===\n`,
      );

      for (const m of messages) {
        const dateIso = new Date((m.timestamp ?? 0) * 1000).toISOString();
        let author = "?";
        try {
          const contact = await m.getContact();
          author =
            contact?.pushname ??
            contact?.name ??
            contact?.verifiedName ??
            (m.author || m.from || "?");
        } catch {
          author = m.author || m.from || "?";
        }

        const fromMe = m.fromMe ? "[ME]" : "";
        const mediaTag = m.hasMedia ? `[MEDIA:${m.type}]` : "";
        const body = (m.body || "").replace(/\s+/g, " ").slice(0, 600);

        console.log(`${dateIso} | ${author} ${fromMe}${mediaTag}`);
        if (body) console.log(`  > ${body}`);

        // Try to download media from Chinnathambi specifically
        if (m.hasMedia && /chinna/i.test(author)) {
          try {
            const media = await m.downloadMedia();
            if (media) {
              const ext = media.mimetype?.split("/")[1]?.split(";")[0] ?? "bin";
              const fname = `chinna-${m.id?._serialized?.replace(/[^a-z0-9]/gi, "_") ?? Date.now()}.${ext}`;
              const out = resolve(MEDIA_DIR, fname);
              writeFileSync(out, Buffer.from(media.data, "base64"));
              console.log(`  >> downloaded: ${out} (${media.mimetype})`);
            }
          } catch (err) {
            console.log(
              `  >> media download failed: ${(err as Error).message}`,
            );
          }
        }
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
}

main();
