import os
from pathlib import Path

import dotenv

from rag_context import build_rag_context, load_qdrant_client


def load_mapping():
    env_path = Path(__file__).resolve().parent.parent / ".env"
    dotenv.load_dotenv(env_path)
    from server.config.topicMapping import getKBTopics
    return getKBTopics


TEST_CASES = [
    {
        "id": "TEST 1",
        "question": "Summarize first-line treatment guidelines.",
        "disease": "NHL",
        "ui_topic": "Treatment Guidelines",
        "mapped_topics": ["Treatment Modalities", "Line Of Therapy Lot Framework"],
    },
    {
        "id": "TEST 2",
        "question": "What are the important treatment options?",
        "disease": "NHL",
        "ui_topic": "Treatment Guidelines",
        "mapped_topics": ["Treatment Modalities", "Line Of Therapy Lot Framework"],
    },
    {
        "id": "TEST 3",
        "question": "What biomarkers influence treatment selection?",
        "disease": "AML",
        "ui_topic": "Diagnosis & Biomarkers",
        "mapped_topics": ["Diagnosis And Clinical Evaluation", "Biomarker Risk Marker Summary"],
    },
    {
        "id": "TEST 4",
        "question": "What factors influence treatment selection in CLL?",
        "disease": "CLL",
        "ui_topic": "Treatment Guidelines",
        "mapped_topics": ["Treatment Modalities", "Line Of Therapy Lot Framework"],
    },
    {
        "id": "TEST 5",
        "question": "How does treatment change across lines of therapy in multiple myeloma?",
        "disease": "MM",
        "ui_topic": "Treatment Sequencing",
        "mapped_topics": ["Line Of Therapy Lot Framework", "Treatment Modalities"],
    },
    {
        "id": "TEST 6",
        "question": "What are the major subtypes of NHL?",
        "disease": "NHL",
        "ui_topic": "Disease Overview",
        "mapped_topics": ["Disease Overview"],
    },
    {
        "id": "TEST 7",
        "question": "What are the key pipeline development areas?",
        "disease": "NHL",
        "ui_topic": "Pipeline Products",
        "mapped_topics": ["Clinical Trial Pipeline", "Key Product Approval Timeline And Market Baskets"],
    },
    {
        "id": "TEST 8",
        "question": "List major pipeline products for lymphoma.",
        "disease": "NHL",
        "ui_topic": "Pipeline Products",
        "mapped_topics": ["Clinical Trial Pipeline", "Key Product Approval Timeline And Market Baskets"],
    },
    {
        "id": "TEST 9",
        "question": "How is treatment sequencing determined for lymphoma?",
        "disease": "NHL",
        "ui_topic": "Treatment Sequencing",
        "mapped_topics": ["Line Of Therapy Lot Framework", "Treatment Modalities"],
    },
    {
        "id": "TEST 10",
        "question": "What are the main treatment options across the disease areas?",
        "disease": None,
        "ui_topic": None,
        "mapped_topics": [],
    },
    {
        "id": "TEST 11",
        "question": "What treatment is used for XYZ123?",
        "disease": None,
        "ui_topic": None,
        "mapped_topics": [],
    },
]


def print_case_summary(test_case, result):
    print("=" * 120)
    print(f"ID: {test_case['id']}")
    print(f"Question: {test_case['question']}")
    print(f"Disease: {test_case['disease'] if test_case['disease'] else 'null'}")
    print(f"UI Topic: {test_case['ui_topic'] if test_case['ui_topic'] else 'null'}")
    print(f"Mapped KB Topics: {test_case['mapped_topics'] if test_case['mapped_topics'] else '[]'}")
    print(f"Primary retrieval result count: {len(result.get('chunks', []))}")
    print(f"Fallback used?: {str(result.get('fallback_used', False)).lower()}")
    print(f"Final result count: {len(result.get('chunks', []))}")
    print("Top 5:")
    for index, chunk in enumerate(result.get('chunks', [])[:5], start=1):
        print(f"  {index}. document={chunk.get('document', 'N/A')} | disease={chunk.get('disease', 'N/A')} | topic={chunk.get('topic', 'N/A')} | section={chunk.get('section', 'N/A')} | score={chunk.get('score', 0.0):.6f}")
    print()


def run_case(test_case):
    mapped_topics = test_case.get('mapped_topics') or []
    result = build_rag_context(
        question=test_case['question'],
        disease=test_case['disease'],
        topic=mapped_topics,
        top_k=5,
        min_score=0.30,
    )
    print_case_summary(test_case, result)
    return result


if __name__ == "__main__":
    print("Running retrieval tests against live Qdrant metadata")
    load_qdrant_client()
    for test_case in TEST_CASES:
        run_case(test_case)

