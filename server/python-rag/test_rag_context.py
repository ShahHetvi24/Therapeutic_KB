from rag_context import build_rag_context


TEST_CASES = [
    {
        "question": "What are the main treatment options?",
        "disease": None,
        "topic": None,
    },
    {
        "question": "What biomarkers influence treatment selection?",
        "disease": "NHL",
        "topic": None,
    },
    {
        "question": "What biomarkers influence treatment selection?",
        "disease": "AML",
        "topic": None,
    },
    {
        "question": "What are the important treatment options?",
        "disease": "NHL",
        "topic": "Treatment Modalities",
    },
]


def print_result(question: str, disease, topic, result):
    print(f"\n{'=' * 90}")
    print(f"Question: {question}")
    print(f"Disease filter: {disease}")
    print(f"Topic filter: {topic}")
    print(f"Retrieved chunks: {len(result['chunks'])}")
    print(f"Unique sources: {result['source_count']}")

    if not result["chunks"]:
        print("No relevant chunks found.")
        return

    for index, chunk in enumerate(result["chunks"], start=1):
        print(f"\n#{index}")
        print(f"  Document: {chunk['document']}")
        print(f"  Disease: {chunk.get('disease', 'N/A')}")
        print(f"  Topic: {chunk['topic']}")
        print(f"  Section: {chunk['section']}")
        print(f"  Score: {chunk['score']:.6f}")
        preview = chunk["text"][:220].replace("\n", " ")
        print(f"  Text preview: {preview}")

    print(f"\nContext preview:\n{result['context'][:500]}...")


def main():
    print("Testing disease-aware and topic-aware retrieval from lymphoma-kb")

    for test in TEST_CASES:
        try:
            result = build_rag_context(
                test["question"],
                top_k=5,
                disease=test["disease"],
                topic=test["topic"],
                min_score=0.30,
            )
            print_result(test["question"], test["disease"], test["topic"], result)
        except Exception as exc:
            print(f"\nError for question: {test['question']}")
            print(f"{exc}")


if __name__ == "__main__":
    main()
