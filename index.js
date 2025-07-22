const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "difybot123";
const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0/743581938836202/messages";
const WHATSAPP_API_TOKEN = "EAAY8eGmSHcwBPD7oDkEVI6xqcnOWHilXznW5RPqbgJSC3JPzcRWlvrsucSY7VTJz4SAKAXQXZBg6cySX02fCmP3OJ5WQLF29qWNadWqSsMdIXTgGE2EfQxiQ3N7ZCfc1LCaoPIGfLLgeoelshmIHN41OAP0gBeiedpSjvZCZAvJmdMZAHt77deFHuS7dBsZB8xqAZDZD";
const DIFY_API_KEY = "app-FZeauDG97xEwFstbireWNH87";

// ✅ Verificação do Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado com sucesso!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Recebendo mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (message && message.text) {
      const text = message.text.body;
      const from = message.from;

      console.log("📩 Mensagem recebida:", text);

      // Envia para o Dify
      const difyResponse = await axios.post(
        "https://api.dify.ai/v1/chat-messages",
        { inputs: {}, query: text, user: from, response_mode: "blocking" },
        { headers: { Authorization: `Bearer ${DIFY_API_KEY}`, "Content-Type": "application/json" } }
      );

      const reply = difyResponse.data.answer;

      // Responde no WhatsApp
      await axios.post(
        WHATSAPP_API_URL,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: reply },
        },
        { headers: { Authorization: `Bearer ${WHATSAPP_API_TOKEN}`, "Content-Type": "application/json" } }
      );
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro ao processar mensagem:", error?.response?.data || error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
