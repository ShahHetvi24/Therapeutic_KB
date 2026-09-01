import argparse
import os
import sys
import uuid
from pathlib import Path

import dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

from chunk_text import chunk_markdown_text, create_topic_from_filename
from embedding_service import generate_embedding

VALID_DISEASES = {"AML", "CLL", "MM", "NHL"}


def resolve_knowledge_base_dir() -> Path:
    base_dir = Path(__file__).resolve().parent.parent

    candidates = [
        base_dir / "knowledge_base",
        base_dir / "knowledge-base",
    ]

    for candidate in candidates:
        if candidate.exists() and candidate.is_dir():
            return candidate

    raise FileNotFoundError(
        "Knowledge base folder not found. Expected one of: "
        f"{', '.join(str(path) for path in candidates)}"
    )


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


def create_collection(client: QdrantClient, collection_name: str):
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
    )


def ensure_collection_exists(client: QdrantClient, collection_name: str):
    try:
        client.get_collection(collection_name)
    except Exception:
        create_collection(client, collection_name)


def ensure_payload_indexes(client: QdrantClient, collection_name: str):
    fields = ["disease", "topic", "document", "section"]

    for field_name in fields:
        try:
            client.get_collection(collection_name)
            try:
                client.create_payload_index(
                    collection_name=collection_name,
                    field_name=field_name,
                    field_schema=models.PayloadSchemaType.KEYWORD,
                    wait=True,
                )
            except Exception:
                pass
        except Exception as exc:
            raise ValueError(f"Unable to access Qdrant collection '{collection_name}': {exc}") from exc


def find_markdown_files(base_dir: Path):
    return sorted(base_dir.rglob("*.md"))


def derive_disease_from_path(file_path: Path):
    parent_name = file_path.parent.name.strip()
    if parent_name in VALID_DISEASES:
        return parent_name

    print(f"Warning: skipping file outside known disease folders: {file_path}")
    return None


def build_point(document_name: str, document_path: str, disease: str, chunk_index: int, chunk_text: str, section: str, topic: str):
    stable_id = str(
        uuid.uuid5(uuid.NAMESPACE_URL, f"{disease}|{document_path}|{chunk_index}")
    )
    vector = generate_embedding(chunk_text)

    return {
        "id": stable_id,
        "vector": vector,
        "payload": {
            "text": chunk_text,
            "document": document_name,
            "documentPath": document_path,
            "disease": disease,
            "topic": topic,
            "section": section,
            "chunkIndex": chunk_index,
        },
    }


def ingest_knowledge_base(batch_size: int = 50, reset_collection: bool = False):
    knowledge_dir = resolve_knowledge_base_dir()
    client, collection_name = load_qdrant_client()

    if reset_collection:
        print("Resetting collection...")
        try:
            client.delete_collection(collection_name)
        except Exception:
            pass
        create_collection(client, collection_name)

    ensure_collection_exists(client, collection_name)
    ensure_payload_indexes(client, collection_name)

    markdown_files = find_markdown_files(knowledge_dir)
    print("Starting ingestion...")
    print(f"Found {len(markdown_files)} Markdown files")

    summary = {disease: 0 for disease in sorted(VALID_DISEASES)}
    total_chunks = 0
    total_uploaded = 0
    files_processed = 0

    for markdown_file in markdown_files:
        disease = derive_disease_from_path(markdown_file)
        if disease is None:
            continue

        try:
            relative_path = markdown_file.relative_to(knowledge_dir)
            print(f"\nProcessing disease: {disease}")
            print(f"File: {relative_path.as_posix()}")

            text = markdown_file.read_text(encoding="utf-8")
            chunks = chunk_markdown_text(text, source_name=markdown_file.name)
            print(f"Chunks created: {len(chunks)}")

            points = []
            for chunk_index, chunk in enumerate(chunks):
                topic = create_topic_from_filename(markdown_file.name)
                point = build_point(
                    document_name=markdown_file.name,
                    document_path=relative_path.as_posix(),
                    disease=disease,
                    chunk_index=chunk_index,
                    chunk_text=chunk["text"],
                    section=chunk["section"],
                    topic=topic,
                )
                points.append(point)

            if not points:
                continue

            for start in range(0, len(points), batch_size):
                batch = points[start:start + batch_size]
                client.upsert(
                    collection_name=collection_name,
                    points=batch,
                    wait=True,
                )
                total_uploaded += len(batch)

            total_chunks += len(chunks)
            files_processed += 1
            summary[disease] += 1
            print(f"Vectors uploaded: {len(points)}")

        except Exception as exc:
            print(f"Error processing {markdown_file.name}: {exc}")
            continue

    print("\nFinal summary:")
    print(f"Files processed: {files_processed}")
    for disease in sorted(VALID_DISEASES):
        print(f"{disease}: {summary[disease]}")
    print(f"Total files: {files_processed}")
    print(f"Total chunks: {total_chunks}")
    print(f"Total vectors uploaded: {total_uploaded}")

    return {
        "files_processed": files_processed,
        "summary_by_disease": summary,
        "total_chunks": total_chunks,
        "total_uploaded": total_uploaded,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Markdown knowledge base into Qdrant.")
    parser.add_argument("--reset", action="store_true", help="Delete and recreate the lymphoma-kb collection before ingestion.")
    args = parser.parse_args()

    try:
        ingest_knowledge_base(reset_collection=args.reset)
    except Exception as exc:
        print(f"Ingestion failed: {exc}")
        sys.exit(1)
