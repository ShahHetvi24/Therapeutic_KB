import logging
from typing import Literal, Optional, Union, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag_context import build_rag_context

logging.basicConfig(level=logging.INFO)


class RetrieveRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=10)
    disease: Optional[Literal["AML", "CLL", "MM", "NHL"]] = None
    topic: Optional[Union[str, List[str]]] = None  # Support both string and array


app = FastAPI(
    title="Lymphoma RAG Service",
    description="Retrieval service for the Therapeutic Knowledge Base Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://6a97303a755b7b07c5c41972--therapeutickb.netlify.app/", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/retrieve")
def retrieve(request: RetrieveRequest):
    try:
        question = request.question.strip()
        if not question:
            return {
                "question": "",
                "disease": request.disease,
                "topic": request.topic,
                "chunks": [],
                "context": "",
                "sources": [],
                "source_count": 0,
                "has_relevant_context": False,
            }

        # Normalize topic: can be string, list, or None
        topic_value = None
        if request.topic is not None:
            if isinstance(request.topic, list):
                # List of topics - filter out empty strings
                filtered = [str(t).strip() for t in request.topic if t and str(t).strip()]
                topic_value = filtered if filtered else None
            else:
                # Single topic string
                topic_str = str(request.topic).strip() if request.topic else None
                topic_value = topic_str if topic_str else None

        result = build_rag_context(
            question=question,
            top_k=request.top_k,
            disease=request.disease,
            topic=topic_value,
        )

        response = {
            "question": result.get("question", question),
            "disease": request.disease,
            "topic": topic_value,
            "chunks": result.get("chunks", []),
            "context": result.get("context", ""),
            "sources": result.get("sources", []),
            "source_count": result.get("source_count", 0),
            "has_relevant_context": result.get("has_relevant_context", False),
        }

        return response

    except Exception as exc:
        logging.exception("Retrieval service failed")
        return {
            "error": True,
            "message": "Retrieval service failed",
        }
