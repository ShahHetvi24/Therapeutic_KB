from chunk_text import chunk_markdown_text, create_topic_from_filename
from embedding_service import generate_embedding, get_embedding_dimension


def main():
    sample_markdown = """# Disease Overview

## Clinical Context

This is a sample paragraph for ingestion testing. It describes the diagnostic context and treatment pathway for a hematologic malignancy. We want to validate that markdown-aware chunking preserves the heading structure and produces usable embeddings.

## Risk Factors

Age, prior chemotherapy, and cytogenetic abnormalities are key risk factors for disease progression.
"""

    chunks = chunk_markdown_text(sample_markdown, source_name="disease-overview.md")

    print(f"Number of chunks: {len(chunks)}")

    dimension = get_embedding_dimension()
    print(f"Embedding dimension: {dimension}")

    embedding = generate_embedding(chunks[0]["text"])
    print(f"Embedding length: {len(embedding)}")

    first_chunk = chunks[0]
    print("First chunk metadata:")
    print({
        "section": first_chunk["section"],
        "text_preview": first_chunk["text"][:180],
        "topic": create_topic_from_filename("disease-overview.md")
    })


if __name__ == "__main__":
    main()
