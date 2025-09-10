import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensagem é obrigatória" });

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "mistral-7b",
        input: message
      })
    });

    const data = await response.json();
    const output = data?.output?.[0] || "Não foi possível gerar resposta.";

    res.status(200).json({ reply: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao processar a mensagem." });
  }
}
