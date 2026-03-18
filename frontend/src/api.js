// api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const sendChatMessage = async (data) => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to send message");

  return res.json();
};
