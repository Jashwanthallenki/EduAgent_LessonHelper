# EduAgent Lesson Helper (Intern Task)

A small full‑stack demo where a student reads a lesson and gets **ASAP clarifications** from **EduAgent** by highlighting text or asking directly.

## MVP (from the original task brief)

- **Lesson content rendered on screen**: a real readable lesson (hardcoded sample topic initially).
- **Highlight → instant help**: highlight lesson text → popover shows **Ask EduAgent**.
- **Context-aware chat**: student can ask multiple doubts; **chat history** is sent so follow‑ups stay in context.
- **Fallback context**: if the student asks without highlighting, the **entire current lesson** is used as context (no generic answers).

## Enhancements added (requested during build)

- **Groq LLM integration**: backend calls Groq Chat Completions (via `GROQ_API_KEY`).
- **`.env` support**: local keys via `backend/.env` (`python-dotenv`) + `backend/.env.example`.
- **Structured student-level answers**: responses follow a fixed template (Summary / Key idea / Step by step / In one line).
- **Answer grounding rules**: EduAgent is instructed to answer **only from the provided lesson/highlight context** and say when info is not present.
- **Adaptive personalization** (no user-level question):
  - Infers **Beginner / Intermediate / Advanced** from the student's questions and recent history.
  - Adjusts language depth automatically.
- **Confusion detection**:
  - Detects phrases like “I didn’t understand”, “explain again”, “still confused” (regex-based, typo-tolerant).
  - Switches into “re-explain more simply” mode when confusion is detected.
  - **Logs** inferred `level` and `confused` flag in the backend console for demo/showcase.
- **Highlight context window**:
  - Along with the exact selection, the frontend extracts **before + after** surrounding text and sends it as `highlight_context`.
  - Helps reduce hallucination by giving the LLM nearby context.
- **Acknowledgement handling**:
  - If the student says “yes got it / ok / thanks” (no real question), backend replies with a short friendly confirmation instead of generating a long answer.
- **Student-provided lessons**:
  - Student can use the sample lesson OR **paste/upload** their own lesson (`.txt`) to read.

## Structure

- `frontend/` – React + Vite app
  - `src/App.jsx` – lesson selection (sample/custom) + opens EduAgent chat
  - `src/components/LessonViewer.jsx` – lesson rendering + highlight detection + context window extraction
  - `src/components/HighlightButton.jsx` – floating “Ask EduAgent” popover near selection
  - `src/components/ChatBox.jsx` – chat UI + session history + sends `lesson_text`, `highlighted_text`, `highlight_context`, and recent messages
  - `src/api.js` – backend API wrapper (`POST /api/chat`)
- `backend/` – FastAPI
  - `main.py` – API endpoints
  - `models.py` – request/response schemas (includes `highlight_context`)
  - `llm.py` – Groq call + prompting (grounding, structure, personalization, confusion detection, acknowledgement handling)

## Running locally

### 1) Backend (FastAPI)

Create `backend/.env`:

```env
GROQ_API_KEY=your_key_here
```

Run:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### 2) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` to the backend.
