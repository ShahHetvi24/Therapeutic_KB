from sentence_transformers import SentenceTransformer
import math

_MODEL = None


def _load_model():
    global _MODEL

    if _MODEL is None:
        print("Loading embedding model...")
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
        print("Embedding model loaded: all-MiniLM-L6-v2")

    return _MODEL


def get_embedding_dimension():
    model = _load_model()
    return model.get_sentence_embedding_dimension()


def generate_embedding(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text must be a non-empty string.")

    model = _load_model()

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