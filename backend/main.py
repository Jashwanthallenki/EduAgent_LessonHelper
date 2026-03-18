from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import ChatRequest, ChatResponse
from llm import answer_question

app = FastAPI(title="EduAgent Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> JSONResponse:
    assistant_message = answer_question(
        lesson_text=req.lesson_text,
        highlighted_text=req.highlighted_text,
        highlight_context=req.highlight_context,
        messages=req.messages,
    )
    return JSONResponse(
        ChatResponse(assistant_message=assistant_message).model_dump()
    )


# For local debugging: `python -m backend.main`
if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

