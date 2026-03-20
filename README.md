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
## 🧩 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite |
| **Backend** | FastAPI (Python) |
| **LLM Engine** | Groq API |
| **State Handling** | Session-based chat history |
| **Environment** | `python-dotenv` |

---

## ⚙️ Local Setup

### 1️⃣ Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create a `.env` file:**
    ```env
    GROQ_API_KEY=your_api_key_here
    ```
3.  **Install dependencies and run:**
    ```bash
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
    * **URL:** `http://127.0.0.1:8000`

### 2️⃣ Frontend Setup (React + Vite)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies and start the dev server:**
    ```bash
    npm install
    npm run dev
    ```
    * **URL:** `http://localhost:5173`
    * *Note: API requests are automatically proxied to `/api/*`*

---

## 📌 Demo Idea

1.  **Load a Lesson:** Import your educational content into the viewer.
2.  **Highlight & Inquire:** Select a specific concept or phrase.
3.  **Engage:** Click **"Ask EduAgent"**.
4.  **Observe:** Watch the agent provide adaptive explanations and structured responses based on your follow-up questions.

---

## 🔮 Future Improvements

* [ ] **Persistent Memory:** Chat history storage using Redis.
* [ ] **RAG Integration:** Full lesson/document retrieval for deeper context.
* [ ] **Learning Analytics:** Tracking student progress and state over time.
* [ ] **Multi-modal Support:** Support for voice and image inputs.
* [ ] **Insights Dashboard:** Visualization of learning trends and pain points.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
