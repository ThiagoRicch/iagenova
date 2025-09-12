import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const SUPABASE_URL = "https://iwiorzjughvsvvfjdodw.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aW9yemp1Z2h2c3Z2Zmpkb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTkwNTMsImV4cCI6MjA3MjMzNTA1M30.bOgpdIs0W6S9ZvGt-l0Lj0CIwBpaO4eIaPRUF75FK-U";

export const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.register = register;
window.login = login;
window.logout = logout;
window.sendMessageToGenova = sendMessageToGenova;

const REPLICATE_API_URL = "/api/genova";

// Registrar usuário
async function register() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!firstName || !lastName || !email || !password) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await client.from("profiles").insert([
        { id: userId, first_name: firstName, last_name: lastName },
      ]);
    }

    alert("Cadastro realizado!");
    window.location.href = "login.html";
  } catch (err) {
    alert("Erro ao registrar: " + err.message);
  }
}

// Login
async function login() {
  const email = document.getElementById("logEmail").value.trim();
  const password = document.getElementById("logPassword").value.trim();

  if (!email || !password) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;

    window.location.href = "index.html";
  } catch (err) {
    alert("Erro ao logar: " + err.message);
  }
}

// Logout
async function logout() {
  await client.auth.signOut();
  window.location.href = "login.html";
}

// Sessão
async function getUserSession() {
  const { data: { session } } = await client.auth.getSession();
  return session?.user || null;
}

// Mostrar usuário
async function showUser() {
  const user = await getUserSession();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  document.getElementById("welcomeMsg").innerText = `Olá, ${profile.first_name} ${profile.last_name}! 🎉`;
  document.getElementById("userInfo").innerText = `Você está logado como: ${user.email}`;
}

// Histórico de chat
async function loadChatHistory() {
  const user = await getUserSession();
  if (!user) return;

  const { data: history } = await client
    .from("chat_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const tbody = document.querySelector("#chatHistory tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  history.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.user_message}</td><td>${item.ai_response}</td><td>${new Date(item.created_at).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
}

// Enviar mensagem para Genova
async function sendMessageToGenova(message) {
  if (!message.trim()) return;

  const user = await getUserSession();
  if (!user) return;

  let userMessageId;
  let aiResponse = "Indisponível no momento.";

  try {
    const { data } = await client
      .from("chat_history")
      .insert([{ user_id: user.id, user_message: message, ai_response: "" }])
      .select()
      .single();

    userMessageId = data.id;

    const res = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const result = await res.json();
    if (result.reply) aiResponse = result.reply;
  } catch (err) {
    console.error("Erro no envio:", err);
  }

  if (userMessageId) {
    await client.from("chat_history").update({ ai_response: aiResponse }).eq("id", userMessageId);
  }

  const tbody = document.querySelector("#chatHistory tbody");
  if (tbody) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${message}</td><td>${aiResponse}</td><td>${new Date().toLocaleString()}</td>`;
    tbody.prepend(tr);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("profile.html")) {
    showUser();
    loadChatHistory();

    const logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    const logoutCardBtn = document.querySelector(".btn-danger");
    if (logoutCardBtn) logoutCardBtn.addEventListener("click", logout);
  }
});
