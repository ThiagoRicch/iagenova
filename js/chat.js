import { client } from "./script.js";

const input = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");
const messages = document.querySelector("#messages");

// Adiciona mensagem na tela
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Atualiza resposta do bot
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

    await client.from("chat_history").insert([
      { user_id: user.id, user_message: userMessage, ai_response: aiMessage },
    ]);
  } catch (err) {
    console.error("Erro ao salvar histórico:", err);
  }
}

// Enviar mensagem
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  addMessage("⌛ A Genova está pensando...", "bot");

  try {
    const res = await fetch("/api/genova", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    const reply = data.reply || "⚠️ Erro na resposta da Genova.";

    updateLastMessage(reply);
    await saveMessage(text, reply);
  } catch (err) {
    updateLastMessage("⚠️ Erro ao conectar.");
    console.error(err);
  }
}

// Eventos
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
