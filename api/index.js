import fetch from "node-fetch";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req, res) {
  const emailId = req.query.id || "desconhecido";

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1405697169381527562/OOuVoNxUACWzOQASQwtRHL2007whnF141twunZ1Q4DLHdjXzUqnbXxczuB3_r1Vn5o0Y";

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `📧 Email aberto! ID: ${emailId}`
      })
    });
  } catch (err) {
    console.error("Erro ao enviar webhook:", err);
  }

  const pixelPath = path.join(process.cwd(), "public", "pixel.png");
  const pixel = await fs.readFile(pixelPath);
  res.setHeader("Content-Type", "image/png");
  res.status(200).send(pixel);
}
