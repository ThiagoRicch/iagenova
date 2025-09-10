import { client } from '../js/script.js';
import { OLLAMA_CONFIG } from '../js/config.js';

const input = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");
const messages = document.querySelector("#messages");

// Adicionar mensagem na interface
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Atualiza última mensagem do bot
function updateLastMessage(text) {
  const last = messages.querySelector(".msg.bot:last-child");
  if (last) last.textContent = text;
  else addMessage(text, "bot");
}

// Salvar histórico no Supabase
async function saveMessage(userMessage, aiMessage) {
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    await client.from('chat_history').insert([{
      user_id: user.id,
      user_message: userMessage,
      ai_response: aiMessage
    }]);
  } catch (err) {
    console.error("Erro ao salvar histórico:", err);
  }
}

// Enviar mensagem para IA
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  let botText = "";

  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_CONFIG.model,
        prompt: "Responda em português: " + text
      })
    });

    if (!response.body) throw new Error("Sem resposta do modelo.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            botText += parsed.response;
            updateLastMessage(botText);
          }
        } catch (err) {
          console.warn("Erro parse:", err);
        }
      }
    }

    await saveMessage(text, botText);

  } catch (err) {
    addMessage("⚠️ Erro ao conectar com o Ollama.", "bot");
    console.error(err);
  }
}

// Eventos de envio
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
