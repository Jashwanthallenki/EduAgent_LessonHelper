export async function sendChatMessage(payload) {
  const res = await fetch("/api/chat", {
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
