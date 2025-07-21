const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const DIFY_API_URL = "SUA_URL_DO_DIFY";
const WHATSAPP_TOKEN = "SEU_TOKEN_DO_WHATSAPP";

app.post('/webhook', async (req, res) => {
  const message = req.body.messages?.[0]?.text?.body || "";

  try {
    const difyResponse = await axios.post(DIFY_API_URL, {
      query: message
    });

    const reply = difyResponse.data.answer || "Desculpe, não entendi.";

    console.log("Resposta para o usuário:", reply);
  } catch (error) {
    console.error("Erro ao se comunicar com o Dify:", error.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
