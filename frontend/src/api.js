const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "").trim();
const CHAT_ENDPOINT = "/api/chat";
const BACKEND_URL = BACKEND_BASE_URL
  ? BACKEND_BASE_URL.replace(/\/+$/, "") + CHAT_ENDPOINT
  : CHAT_ENDPOINT;

export async function sendChatMessage(payload) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
}
