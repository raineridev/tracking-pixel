import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1405697169381527562/OOuVoNxUACWzOQASQwtRHL2007whnF141twunZ1Q4DLHdjXzUqnbXxczuB3_r1Vn5o0Y";

app.get("/track/:id", async (req, res) => {
  const emailId = req.params.id;

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `📧 Email aberto! ID do email: ${emailId}`
      })
    });
  } catch (err) {
    console.error("Erro ao enviar webhook:", err);
  }

  res.sendFile(path.join(__dirname, "pixel.png"));
});

app.listen(PORT, () => {
  console.log(`Servidor de rastreamento rodando na porta ${PORT}`);
});
