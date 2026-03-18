from pydantic import BaseModel
from typing import List


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    lesson_text: str
    highlighted_text: str | None = None
    highlight_context: str | None = None
    messages: List[Message]


class ChatResponse(BaseModel):
    assistant_message: Message
