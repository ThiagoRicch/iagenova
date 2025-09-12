export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    console.log("👉 Nova requisição recebida:", message);

    // Envia para Replicate
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "db21e45f2b2177d6efb32dbf62c8b9e9d8b0cbb59fa3f4b7d63f9a96f45e7c54",
        input: { prompt: message },
      }),
    });

    let data = await prediction.json();

    // Poll até terminar
    while (data.status !== "succeeded" && data.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      data = await poll.json();
    }

    if (data.status === "succeeded") {
      const output = Array.isArray(data.output)
        ? data.output.join(" ")
        : data.output || "Sem saída.";
      return res.status(200).json({ reply: output });
    } else {
      return res.status(500).json({ error: "Falha ao gerar resposta.", details: data });
    }
  } catch (error) {
    console.error("🚨 Erro Replicate:", error);
    res.status(500).json({ error: "Erro ao processar a mensagem.", details: error.message });
  }
}
