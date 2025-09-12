export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensagem é obrigatória" });

  try {
    console.log("👉 Nova requisição recebida:", message);

    // Criar prediction no Replicate usando GPT-J
    const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "7c12d1c69e5b4f3eb7f1c0f14b2a0f8e3d79e7c7", // GPT-J versão no Replicate
        input: { prompt: message },
      }),
    });

    let data = await predictionRes.json();
    console.log("📤 Prediction inicial:", data);

    // Polling com timeout de 9s
    const start = Date.now();
    const TIMEOUT = 30000;

    while (data.status !== "succeeded" && data.status !== "failed") {
      if (Date.now() - start > TIMEOUT) {
        console.warn("⏳ Timeout atingido");
        return res.status(504).json({ reply: "Genova está demorando para responder. Tente novamente." });
      }
      await new Promise(r => setTimeout(r, 1000));

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      data = await pollRes.json();
      console.log("🔄 Atualização do Replicate:", data);
    }

    if (data.status === "succeeded") {
      const output = Array.isArray(data.output) ? data.output.join(" ") : data.output || "Sem saída do modelo.";
      console.log("✅ Prediction concluída:", output);
      return res.status(200).json({ reply: output });
    } else {
      console.error("❌ Prediction falhou:", data);
      return res.status(500).json({ error: "Falha ao gerar resposta.", details: data });
    }

  } catch (error) {
    console.error("🚨 Erro Replicate:", error);
    return res.status(500).json({ error: "Erro ao processar a mensagem.", details: error.message });
  }
}

