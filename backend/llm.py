from __future__ import annotations

from typing import List, Literal
import re
import logging

from dotenv import load_dotenv
from groq import Groq

from models import Message


_client: Groq | None = None

# Simple logger for demo / debugging in the console
logger = logging.getLogger("eduagent.llm")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="[EduAgent] %(message)s")


def get_client() -> Groq:
    """
    Lazily create a Groq client.

    GROQ_API_KEY will be read from the environment. For local dev you can put
    it in a `.env` file next to `backend/main.py` and it will be loaded once.
    """
    global _client
    if _client is None:
        # Load environment variables from .env (safe to call multiple times)
        load_dotenv()
        _client = Groq()
    return _client


def build_messages(
    lesson_text: str,
    highlighted_text: str | None,
    highlight_context: str | None,
    messages: List[Message],
) -> list[dict]:
    """Build chat messages for Groq using lesson + history."""
    system_prompt = (
        "You are EduAgent, a friendly science tutor for a school student.\n"
        "You MUST ground every part of your answer ONLY in the lesson content I provide.\n"
        "Do NOT invent new facts. If the lesson does not contain enough information to answer,\n"
        "clearly say that and only explain what CAN be inferred from the lesson.\n"
        "Your job is to make the idea feel easy and concrete for a 12–16 year old.\n\n"
        "Your answer MUST follow exactly this markdown template, including headings and line breaks:\n\n"
        "Summary:\n"
        "- <one very short sentence in simple words>\n\n"
        "Key idea:\n"
        "- <bullet 1>\n"
        "- <bullet 2>\n"
        "- <bullet 3 (optional)>\n\n"
        "Step by step:\n"
        "1. <step 1 in one short sentence>\n"
        "2. <step 2 in one short sentence>\n"
        "3. <step 3 in one short sentence>\n"
        "4. <step 4 in one short sentence (optional)>\n\n"
        "In one line:\n"
        "- <very short recap>\n\n"
        "Grounding rules:\n"
        "- Base every bullet and step directly on the lesson text or the highlighted part.\n"
        "- Do NOT add extra scientific details that are not mentioned in the lesson.\n"
        "- If the student asks something outside the lesson, say you can only answer using the current lesson.\n"
        "- Start from the highlighted text (if any) and connect it to the whole lesson.\n\n"
        "After the structured response, write 1–2 short questions to check the student's understanding\n"
        "and finish with a friendly wrap‑up sentence."
    )

    # Infer approximate student level + confusion from recent user messages
    def infer_level_and_confusion(msgs: List[Message]) -> tuple[Literal["beginner", "intermediate", "advanced"], bool]:
        last_user = next((m for m in reversed(msgs) if m.role == "user"), None)
        if not last_user:
            return "beginner", False

        text = last_user.content.lower()

        advanced_signals = ["mechanism", "derive", "prove", "quantitative", "equation", "stoichiometry"]
        intermediate_signals = ["why", "how", "reason", "cause", "relationship", "compare"]

        # Confusion patterns (robust to typos and variants)
        confusion_patterns = [
            r"\bi\s*d(i|id|did)nt\s+under(sta|sta)?nd\b",  # "i didnt understand", "i diddnt understad", etc.
            r"\bi\s+did\s+not\s+understand\b",
            r"\bexplain\s+again\b",
            r"\bstill\s+confus(ed|ing)?\b",
            r"\bnot\s+clear\b",
            r"\bthis\s+is\s+confus(ed|ing)?\b",
            r"\bconfus(ed|ing)\b",
        ]
        confused = any(re.search(pat, text) for pat in confusion_patterns)

        if any(word in text for word in advanced_signals):
            return "advanced", confused
        if any(word in text for word in intermediate_signals):
            return "intermediate", confused
        if len(text.split()) <= 8:
            return "beginner", confused
        return "intermediate", confused

    level, is_confused = infer_level_and_confusion(messages)

    # Log for demo purposes so you can show adaptive behaviour
    try:
        last_user = next((m for m in reversed(messages) if m.role == "user"), None)
        snippet = (last_user.content[:80] + "...") if last_user and len(last_user.content) > 80 else (last_user.content if last_user else "")
        logger.info(
            "Inferred level=%s, confused=%s, last_user=\"%s\"",
            level.upper(),
            is_confused,
            snippet,
        )
    except Exception:
        # Logging should never break the main flow
        pass

    context_intro = []
    if highlighted_text:
        context_intro.append("Here is the highlighted part the student selected:\n")
        context_intro.append(highlighted_text.strip())

        if highlight_context:
            context_intro.append("\nHere is a small surrounding context window (before + after) from the lesson:\n")
            context_intro.append(highlight_context.strip())
    else:
        context_intro.append("Here is the full lesson the student is reading:\n")
        context_intro.append(lesson_text.strip())

    context_block = "\n".join(context_intro)

    groq_messages: list[dict] = [
        {"role": "system", "content": system_prompt},
        {
            "role": "system",
            "content": (
                f"Student level inferred from their questions: {level.upper()}.\n"
                f"- If BEGINNER: use very simple words, concrete examples, avoid formulas unless in the lesson.\n"
                f"- If INTERMEDIATE: connect ideas, explain 'why' and 'how' with a bit more detail.\n"
                f"- If ADVANCED: you may use precise scientific terms from the lesson and focus on deeper reasoning.\n"
                + (
                    "\nThe latest message shows clear confusion (e.g. 'I didn't understand', 'explain again', 'still confused').\n"
                    "In this case, slow down, re-explain the same idea in a NEW way, use an even simpler analogy,\n"
                    "and highlight the single most important takeaway in plain words.\n"
                    if is_confused
                    else ""
                )
            ),
        },
        {
            "role": "system",
            "content": context_block,
        },
    ]

    for m in messages:
        # Pass through existing user/assistant turns
        groq_messages.append({"role": m.role, "content": m.content})

    return groq_messages


def call_groq(
    lesson_text: str,
    highlighted_text: str | None,
    highlight_context: str | None,
    messages: List[Message],
) -> str:
    client = get_client()
    groq_messages = build_messages(lesson_text, highlighted_text, highlight_context, messages)

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=groq_messages,
        temperature=0.2,
    )
    return completion.choices[0].message.content or ""


def answer_question(
    lesson_text: str,
    highlighted_text: str | None,
    highlight_context: str | None,
    messages: List[Message],
) -> Message:
    # If the student is just acknowledging, keep it short (no big template).
    last_user = next((m for m in reversed(messages) if m.role == "user"), None)
    if last_user:
        t = last_user.content.strip().lower()
        ack_patterns = [
            r"^(y(ea)?s+|yep|yeah)\b.*\b(got\s+it|understood|ok(ay)?|makes\s+sense)\b",
            r"^(ok(ay)?|alright|cool|nice)\b(\s*[,!.]|$)",
            r"^(thanks|thank\s+you|thx)\b(\s*[,!.]|$)",
            r"^(got\s+it|understood|makes\s+sense)\b(\s*[,!.]|$)",
        ]
        if any(re.search(pat, t) for pat in ack_patterns) and "?" not in t:
            return Message(
                role="assistant",
                content=(
                    "Great — glad you got it.\n\n"
                    "If you want, you can highlight another line or ask your next doubt anytime."
                ),
            )

    text = call_groq(lesson_text, highlighted_text, highlight_context, messages)
    return Message(role="assistant", content=text)

