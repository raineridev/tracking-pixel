import fetch from "node-fetch";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req, res) {
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/ID/TOKEN";

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `📧 Email aberto!` })
  });

  const pixelPath = path.join(process.cwd(), "public", "image.png");
  const pixel = await fs.readFile(pixelPath);
  res.setHeader("Content-Type", "image/png");
  res.status(200).send(pixel);
}
