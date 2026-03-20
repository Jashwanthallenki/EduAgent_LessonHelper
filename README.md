# EduAgent Lesson Helper

EduAgent Lesson Helper is a full-stack learning assistant that enables students to get **instant, context-aware clarifications** while reading study material. By highlighting text or asking questions, students receive structured, adaptive explanations grounded strictly in the lesson content.

---

## 🚀 Features

### 📖 Interactive Lesson Reading
- Displays structured lesson content (sample or user-provided)
- Enables real-time interaction while reading

### ✏️ Highlight-Based Assistance
- Highlight any text in the lesson
- Instant **“Ask EduAgent”** popover appears
- Uses selected text + surrounding context for accurate answers

### 💬 Context-Aware Chat
- Maintains conversation history
- Supports follow-up questions with continuity

### 🔄 Fallback Context Handling
- If no highlight is selected:
  - Uses the **entire lesson** as context
- Prevents generic or irrelevant responses

---

## 🧠 Advanced Capabilities

### ⚡ Groq LLM Integration
- Fast responses using Groq Chat Completions
- API key managed via `.env`

### 📊 Structured Responses
Each answer follows a consistent format:
- **Summary**
- **Key Idea**
- **Step-by-Step Explanation**
- **One-Line Answer**

### 🎯 Answer Grounding
- Responses strictly based on:
  - Highlighted text OR
  - Lesson content
- Clearly states when information is not available

### 🎓 Adaptive Personalization
- Automatically infers student level:
  - Beginner / Intermediate / Advanced
- Adjusts explanation depth dynamically

### 😕 Confusion Detection
- Detects phrases like:
  - “I didn’t understand”
  - “Explain again”
  - “Still confused”
- Triggers simpler re-explanations
- Logs:
  - `student_level`
  - `confused_flag`

### 🔍 Highlight Context Window
- Sends:
  - Selected text
  - Surrounding context (before + after)
- Improves accuracy and reduces hallucinations

### 👍 Smart Acknowledgement Handling
- Detects responses like:
  - “Got it”, “Thanks”
- Returns short confirmations instead of long answers

### 📂 Custom Lesson Support
- Use sample lessons OR
- Paste your own content OR
- Upload `.txt` files

---

## 🏗️ Project Structure

### Frontend (React + Vite)

frontend/
├── src/
│ ├── App.jsx
│ ├── components/
│ │ ├── LessonViewer.jsx
│ │ ├── HighlightButton.jsx
│ │ ├── ChatBox.jsx
│ ├── api.js


### Backend (FastAPI)

backend/
├── main.py
├── models.py
├── llm.py


---

## ⚙️ Local Setup

### 1️⃣ Backend Setup (FastAPI)

Create `backend/.env`:
``env
GROQ_API_KEY=your_api_key_here

Run:

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:

http://127.0.0.1:8000
2️⃣ Frontend Setup (React + Vite)
cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173

API requests are proxied to /api/*

🌟 Key Highlights

Real-time AI-powered learning assistant

Context-grounded LLM responses (no hallucination drift)

Adaptive explanation based on student level

Clean full-stack architecture

Easily extensible (Redis, RAG, user state tracking)

🔮 Future Improvements

Persistent chat using Redis

RAG for full lesson/document retrieval

Student learning state tracking

Multi-modal inputs (voice, images)

Analytics dashboard for learning insights

🧩 Tech Stack

Frontend: React, Vite

Backend: FastAPI

LLM: Groq API

State Handling: Session-based chat history

Environment Management: python-dotenv

📌 Demo Idea

Load a lesson

Highlight a concept

Click Ask EduAgent

Ask follow-up questions

Observe adaptive explanations and structured responses


---

If you want, next I can:
- Make this **ATS-optimized resume bullet (very strong impact)**
- Or create a **killer GitHub description + tags**
- Or help you prepare **interviewer Q&A based on this project** 🚀
