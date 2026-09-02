from sentence_transformers import SentenceTransformer
import math
import logging

_MODEL = None
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

logger = logging.getLogger(__name__)


def load_embedding_model():
    global _MODEL

    if _MODEL is None:
        logger.info("Loading embedding model...")
        _MODEL = SentenceTransformer(MODEL_NAME, device="cpu")
        logger.info("Embedding model loaded successfully.")

    return _MODEL


def get_embedding_dimension():
    model = load_embedding_model()
    return model.get_sentence_embedding_dimension()


def generate_embedding(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text must be a non-empty string.")

    model = load_embedding_model()

    embedding = model.encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    vector = [float(x) for x in embedding.tolist()]

    expected_dimension = 384

    if len(vector) != expected_dimension:
        raise ValueError(
            f"Embedding dimension mismatch: "
            f"got {len(vector)}, expected {expected_dimension}"
        )

    # Optional safety check
    norm = math.sqrt(sum(x * x for x in vector))

    if norm == 0 or math.isnan(norm):
        raise ValueError("Invalid embedding generated.")

    return vector