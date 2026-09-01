import os
import re
from pathlib import Path

import dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

from embedding_service import generate_embedding

# ============================================================================
# HYBRID RELEVANCE SCORING CONFIG
# ============================================================================
# Configure the weights used in the hybrid scoring formula
HYBRID_SCORE_WEIGHTS = {
    "semantic": 0.60,      # Qdrant semantic similarity
    "lexical": 0.25,       # Keyword overlap
    "topic": 0.10,         # Topic relevance
    "phrase": 0.05,        # Exact phrase bonus
}

# Stop words to ignore when extracting keywords
STOP_WORDS = {
    "the", "is", "are", "for", "what", "how", "does", "and", "of", "in",
    "a", "an", "to", "be", "have", "this", "that", "with", "at", "by",
    "from", "as", "on", "it", "or", "was", "were", "been", "being",
    "will", "do", "does", "did", "would", "could", "should", "may",
    "might", "can", "which", "who", "where", "when", "why", "if",
    "then", "about", "any", "all", "each", "every", "some", "such",
}

# Candidate pool multiplier: retrieve more candidates to rerank
CANDIDATE_K_MULTIPLIER = 4
MIN_CANDIDATE_K = 20


def load_qdrant_client():
    env_path = Path(__file__).resolve().parent.parent / ".env"
    dotenv.load_dotenv(env_path)

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION", "lymphoma-kb")

    if not qdrant_url:
        raise ValueError("QDRANT_URL is missing from server/.env")
    if not qdrant_api_key:
        raise ValueError("QDRANT_API_KEY is missing from server/.env")
    if not collection_name:
        raise ValueError("QDRANT_COLLECTION is missing from server/.env")

    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    return client, collection_name


def normalize_topic_name(topic_value):
    if topic_value is None:
        return ""
    return re.sub(r"[^a-z0-9]+", " ", str(topic_value).strip().lower()).strip()


def extract_keywords(text):
    """
    Extract meaningful keywords from text.
    Normalize to lowercase, remove punctuation, filter stop words.
    Returns a set of keywords.
    """
    if not text:
        return set()
    # Convert to lowercase and remove punctuation
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    # Split into words and filter stop words
    words = text.split()
    keywords = {w for w in words if w and len(w) > 1 and w not in STOP_WORDS}
    return keywords


def calculate_lexical_score(question, chunk_text, chunk_section, chunk_document):
    """
    Calculate lexical keyword overlap score.
    Compare keywords from question against chunk text, section, and document name.
    Range: 0.0 to 1.0
    """
    question_keywords = extract_keywords(question)
    if not question_keywords:
        return 0.0

    # Combine chunk content for comparison
    combined_chunk_content = " ".join([chunk_text or "", chunk_section or "", chunk_document or ""])
    chunk_keywords = extract_keywords(combined_chunk_content)

    if not chunk_keywords:
        return 0.0

    # Calculate Jaccard similarity
    overlap = len(question_keywords & chunk_keywords)
    union = len(question_keywords | chunk_keywords)

    if union == 0:
        return 0.0

    return min(1.0, overlap / union)


def calculate_phrase_bonus(question, chunk_text, chunk_section, chunk_document):
    """
    Check for exact phrase matches (case-insensitive).
    Returns bonus points if phrases from question appear in chunk.
    Range: 0.0 to 1.0
    """
    if not question or not chunk_text:
        return 0.0

    question_lower = str(question).lower()
    chunk_combined = " ".join([
        str(chunk_text or "").lower(),
        str(chunk_section or "").lower(),
        str(chunk_document or "").lower()
    ])

    # Look for multi-word phrases from question
    phrases = []
    words = question_lower.split()
    for i in range(len(words) - 1):
        if words[i] not in STOP_WORDS and words[i + 1] not in STOP_WORDS:
            phrases.append(" ".join(words[i : i + 2]))

    if not phrases:
        return 0.0

    matches = sum(1 for phrase in phrases if phrase in chunk_combined)
    return min(1.0, matches / len(phrases))


def calculate_topic_score(chunk_topic, requested_topics):
    """
    Calculate topic relevance score.
    Exact match: 1.0, Related: 0.5, Unrelated: 0.0
    Range: 0.0 to 1.0
    """
    if not requested_topics:
        return 0.5  # Neutral score if no specific topic requested

    if not chunk_topic:
        return 0.0

    normalized_chunk_topic = normalize_topic_name(chunk_topic)
    if not normalized_chunk_topic:
        return 0.0

    # Check for exact match
    for req_topic in requested_topics:
        normalized_req = normalize_topic_name(req_topic)
        if normalized_req == normalized_chunk_topic:
            return 1.0

    # Check for partial match (related topics)
    for req_topic in requested_topics:
        normalized_req = normalize_topic_name(req_topic)
        chunk_words = set(normalized_chunk_topic.split())
        req_words = set(normalized_req.split())
        if chunk_words & req_words:  # Any word overlap
            return 0.5

    return 0.0


def calculate_hybrid_score(chunk, question, requested_topics):
    """
    Calculate hybrid relevance score combining multiple scoring methods.
    Range: 0.0 to 1.0
    
    Returns:
        float: Final hybrid score
    """
    semantic_score = float(chunk.get("score", 0.0))
    lexical_score = calculate_lexical_score(
        question,
        chunk.get("text", ""),
        chunk.get("section", ""),
        chunk.get("document", "")
    )
    topic_score = calculate_topic_score(chunk.get("topic", ""), requested_topics)
    phrase_score = calculate_phrase_bonus(
        question,
        chunk.get("text", ""),
        chunk.get("section", ""),
        chunk.get("document", "")
    )

    final_score = (
        HYBRID_SCORE_WEIGHTS["semantic"] * semantic_score +
        HYBRID_SCORE_WEIGHTS["lexical"] * lexical_score +
        HYBRID_SCORE_WEIGHTS["topic"] * topic_score +
        HYBRID_SCORE_WEIGHTS["phrase"] * phrase_score
    )

    return {
        "final_score": min(1.0, max(0.0, final_score)),
        "semantic_score": semantic_score,
        "lexical_score": lexical_score,
        "topic_score": topic_score,
        "phrase_score": phrase_score,
    }


def build_disease_filter(disease: str):
    if not disease or not str(disease).strip():
        return None

    return models.Filter(
        must=[
            models.FieldCondition(
                key="disease",
                match=models.MatchValue(value=str(disease).strip()),
            )
        ]
    )


def build_topic_filter(topic):
    """
    Build a topic filter that supports both a single mapped topic and a list of
    mapped topics. Multiple mapped topics use OR semantics, so the retrieval
    still works when a UI topic expands to multiple relevant KB topics.
    """
    if not topic:
        return None

    if isinstance(topic, list):
        topics = [str(t).strip() for t in topic if t and str(t).strip()]
        if not topics:
            return None
        if len(topics) == 1:
            return models.Filter(
                must=[
                    models.FieldCondition(
                        key="topic",
                        match=models.MatchValue(value=topics[0]),
                    )
                ]
            )

        return models.Filter(
            should=[
                models.FieldCondition(
                    key="topic",
                    match=models.MatchValue(value=t),
                )
                for t in topics
            ]
        )

    topic_str = str(topic).strip()
    if not topic_str:
        return None

    return models.Filter(
        must=[
            models.FieldCondition(
                key="topic",
                match=models.MatchValue(value=topic_str),
            )
        ]
    )


def build_metadata_filter(disease=None, topic=None):
    must = []
    should = []

    disease_filter = build_disease_filter(disease)
    topic_filter = build_topic_filter(topic)

    if disease_filter is not None:
        must.extend(disease_filter.must)
    if topic_filter is not None:
        if getattr(topic_filter, "must", None):
            must.extend(topic_filter.must)
        if getattr(topic_filter, "should", None):
            should.extend(topic_filter.should)

    if should:
        return models.Filter(must=must, should=should)
    if must:
        return models.Filter(must=must)
    return None


def normalize_chunk(hit, enriched_scores=None):
    """
    Normalize chunk from Qdrant response.
    Optionally include enriched hybrid scoring metadata.
    """
    payload = hit.payload or {}
    score = float(getattr(hit, "score", 0.0) or 0.0)

    chunk = {
        "text": str(payload.get("text", "")).strip(),
        "document": str(payload.get("document", "")).strip(),
        "documentPath": str(payload.get("documentPath", payload.get("document", ""))).strip(),
        "disease": str(payload.get("disease", "")).strip() if payload.get("disease") not in (None, "") else "",
        "topic": str(payload.get("topic", "")).strip(),
        "section": str(payload.get("section", "")).strip(),
        "chunkIndex": payload.get("chunkIndex", 0),
        "score": round(score, 6),
    }

    # Add enriched scoring metadata if provided
    if enriched_scores:
        chunk.update({
            "semantic_score": round(enriched_scores.get("semantic_score", 0.0), 6),
            "lexical_score": round(enriched_scores.get("lexical_score", 0.0), 6),
            "topic_score": round(enriched_scores.get("topic_score", 0.0), 6),
            "phrase_score": round(enriched_scores.get("phrase_score", 0.0), 6),
            "final_score": round(enriched_scores.get("final_score", 0.0), 6),
        })

    return chunk


def topic_has_relevance(chunk_topic, requested_topics):
    if not requested_topics:
        return True
    normalized_chunk = normalize_topic_name(chunk_topic)
    if not normalized_chunk:
        return False
    return any(normalize_topic_name(t) == normalized_chunk for t in requested_topics)


def has_strong_candidates(chunks, requested_topics=None, min_score=0.30):
    """
    Improved sufficiency check using hybrid scores.
    Returns True if there is sufficient relevant context to answer a question.
    
    Criteria:
    1. At least one chunk with strong hybrid score (>= min_score)
    2. OR multiple reasonably relevant chunks (hybrid score >= 0.25)
    3. OR strong topic/section match with any chunk
    4. OR multiple chunks from same disease
    """
    if not chunks:
        return False

    # Check for at least one strong candidate
    strong_candidates = [c for c in chunks if c.get("final_score", c.get("score", 0)) >= min_score]
    if strong_candidates:
        return True

    # Check for multiple reasonably relevant candidates
    reasonable_candidates = [c for c in chunks if c.get("final_score", c.get("score", 0)) >= 0.25]
    if len(reasonable_candidates) >= 2:
        return True

    # Check for strong topic match
    if requested_topics:
        topic_matching = [c for c in chunks if topic_has_relevance(c.get("topic"), requested_topics)]
        if topic_matching:
            return True

    # Check for multiple chunks from same disease (indicates comprehensive retrieval)
    if len(chunks) >= 2:
        return True

    # At least one chunk with any relevance
    return len(chunks) >= 1


def fetch_query_results(client, collection_name, question, query_filter=None, limit=5):
    """
    Fetch query results from Qdrant.
    Retrieves more candidates initially for reranking.
    """
    query_vector = generate_embedding(str(question).strip())

    # Retrieve more candidates for reranking
    candidate_k = max(limit * CANDIDATE_K_MULTIPLIER, MIN_CANDIDATE_K)

    response = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        query_filter=query_filter,
        limit=candidate_k,
        with_payload=["text", "document", "documentPath", "disease", "topic", "section", "chunkIndex"],
        with_vectors=False,
    )

    points = response.points if hasattr(response, "points") else []
    return [normalize_chunk(hit) for hit in points if hit]


def rerank_candidates(candidates, question, requested_topics, top_k=5):
    """
    Rerank candidates using hybrid scoring.
    Returns top_k candidates sorted by final_score descending.
    """
    if not candidates:
        return []

    # Calculate hybrid scores for all candidates
    scored_chunks = []
    for chunk in candidates:
        scores = calculate_hybrid_score(chunk, question, requested_topics)
        enriched_chunk = chunk.copy()
        enriched_chunk.update(scores)
        scored_chunks.append(enriched_chunk)

    # Sort by final_score descending
    scored_chunks.sort(key=lambda x: x.get("final_score", 0.0), reverse=True)

    return scored_chunks[:top_k]


def deduplicate_chunks(chunks):
    """
    Remove duplicate chunks to avoid redundant context.
    Keeps chunk with highest score if duplicates are found.
    """
    seen = {}
    for chunk in chunks:
        key = (chunk.get("document", ""), chunk.get("disease", ""), chunk.get("topic", ""), chunk.get("section", ""))
        if key not in seen:
            seen[key] = chunk
        else:
            # Keep the one with higher score
            if chunk.get("final_score", chunk.get("score", 0)) > seen[key].get("final_score", seen[key].get("score", 0)):
                seen[key] = chunk

    return list(seen.values())


def build_context_string(chunks):
    if not chunks:
        return ""

    blocks = []
    for chunk in chunks:
        block = (
            f"Source: {chunk['document']}\n"
            f"Document Path: {chunk['documentPath']}\n"
            f"Disease: {chunk['disease']}\n"
            f"Topic: {chunk['topic']}\n"
            f"Section: {chunk['section']}\n\n"
            f"{chunk['text'].strip()}\n"
        )
        blocks.append(block)

    return "\n---\n\n".join(blocks)


def deduplicate_sources(chunks):
    seen = set()
    sources = []

    for chunk in chunks:
        key = (chunk.get("document", ""), chunk.get("disease", ""), chunk.get("topic", ""), chunk.get("section", ""))
        if key in seen:
            continue
        seen.add(key)
        sources.append({
            "document": chunk.get("document", ""),
            "documentPath": chunk.get("documentPath", chunk.get("document", "")),
            "disease": chunk.get("disease", ""),
            "topic": chunk.get("topic", ""),
            "section": chunk.get("section", ""),
        })

    return sources


def retrieve_context(question, top_k=5, disease=None, topic=None, min_score=0.30):
    """
    Hybrid retrieval with improved relevance scoring and fallback strategy.
    
    STEP 1: Disease + Topic search (if both provided)
    STEP 2: Fallback to Disease-only (if disease was specified)
    STEP 3: Fallback to Global (if no disease was specified)
    
    Never broaden to other diseases.
    """
    if not question or not str(question).strip():
        raise ValueError("Question cannot be empty.")

    client, collection_name = load_qdrant_client()

    try:
        client.get_collection(collection_name)
    except Exception as exc:
        raise RuntimeError(f"Collection '{collection_name}' is not available: {exc}") from exc

    requested_topics = topic if isinstance(topic, list) else ([topic] if topic else [])
    used_fallback = False
    final_chunks = []

    # STEP 1: Primary search with disease + topic (if applicable)
    if disease or topic:
        primary_filter = build_metadata_filter(disease=disease, topic=topic)
        if primary_filter:
            primary_chunks = fetch_query_results(
                client, collection_name, question, query_filter=primary_filter, limit=top_k
            )
            # Rerank using hybrid scoring
            primary_chunks = rerank_candidates(primary_chunks, question, requested_topics, top_k=top_k)
            final_chunks = primary_chunks

    # STEP 2: Fallback to disease-only if primary was weak
    if not has_strong_candidates(final_chunks, requested_topics=requested_topics, min_score=min_score):
        if disease:
            disease_only_filter = build_metadata_filter(disease=disease, topic=None)
            if disease_only_filter:
                fallback_chunks = fetch_query_results(
                    client, collection_name, question, query_filter=disease_only_filter, limit=top_k
                )
                # Rerank using hybrid scoring
                fallback_chunks = rerank_candidates(fallback_chunks, question, requested_topics, top_k=top_k)
                if has_strong_candidates(fallback_chunks, requested_topics=requested_topics, min_score=min_score):
                    used_fallback = True
                    final_chunks = fallback_chunks

    # STEP 3: Fallback to global search (if no disease was specified)
    if not has_strong_candidates(final_chunks, requested_topics=requested_topics, min_score=min_score):
        if not disease:
            global_chunks = fetch_query_results(
                client, collection_name, question, query_filter=None, limit=top_k
            )
            # Rerank using hybrid scoring
            global_chunks = rerank_candidates(global_chunks, question, requested_topics, top_k=top_k)
            if has_strong_candidates(global_chunks, requested_topics=requested_topics, min_score=min_score):
                used_fallback = True
                final_chunks = global_chunks

    # Deduplicate and prepare final result
    final_chunks = deduplicate_chunks(final_chunks)

    if not final_chunks:
        return {
            "question": str(question).strip(),
            "chunks": [],
            "context": "",
            "sources": [],
            "source_count": 0,
            "has_relevant_context": False,
            "fallback_used": used_fallback,
        }

    sources = deduplicate_sources(final_chunks)

    result = {
        "question": str(question).strip(),
        "chunks": final_chunks,
        "context": build_context_string(final_chunks),
        "sources": sources,
        "source_count": len(sources),
        "has_relevant_context": True,
        "fallback_used": used_fallback,
    }

    return result


def build_rag_context(question, top_k=5, disease=None, topic=None, min_score=0.30):
    """
    Public API for RAG context building.
    Wraps retrieve_context with hybrid relevance scoring.
    """
    return retrieve_context(question, top_k=top_k, disease=disease, topic=topic, min_score=min_score)
