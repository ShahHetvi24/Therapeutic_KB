import logging
import math

from fastembed import TextEmbedding

_MODEL = None
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EXPECTED_DIMENSION = 384

logger = logging.getLogger(__name__)


def load_embedding_model():
    global _MODEL

    if _MODEL is None:
        logger.info("Loading lightweight embedding model...")
        _MODEL = TextEmbedding(model_name=MODEL_NAME)
        logger.info("Embedding model loaded successfully.")

    return _MODEL


def get_embedding_dimension():
    model = load_embedding_model()
    sample = list(model.embed(["dimension check"]))[0]
    vector = [float(x) for x in sample.tolist()] if hasattr(sample, "tolist") else [float(x) for x in sample]

    if len(vector) != EXPECTED_DIMENSION:
        raise ValueError(
            f"Embedding dimension mismatch: got {len(vector)}, expected {EXPECTED_DIMENSION}"
        )

    return len(vector)


def generate_embedding(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text must be a non-empty string.")

    model = load_embedding_model()
    embedding = list(model.embed([text]))[0]
    vector = [float(x) for x in embedding.tolist()] if hasattr(embedding, "tolist") else [float(x) for x in embedding]

    if len(vector) != EXPECTED_DIMENSION:
        raise ValueError(
            f"Embedding dimension mismatch: got {len(vector)}, expected {EXPECTED_DIMENSION}"
        )

    norm = math.sqrt(sum(x * x for x in vector))

    if norm == 0 or math.isnan(norm):
        raise ValueError("Invalid embedding generated.")

    return vector