import requests


BASE_URL = "http://127.0.0.1:8000"


def print_separator():
    print("\n" + "=" * 90)


def test_health():
    print_separator()
    print("Testing GET /health")

    try:
        response = requests.get(
            f"{BASE_URL}/health",
            timeout=30
        )

        print(f"HTTP status: {response.status_code}")
        print(f"Response: {response.text}")

        response.raise_for_status()

        data = response.json()

        assert data.get("status") == "healthy"

        print("✅ Health check passed")

    except Exception as error:
        print(f"❌ Health check failed: {error}")


def test_retrieve(question, disease=None, topic=None, top_k=5):
    print_separator()
    print("Testing POST /retrieve")

    request_body = {
        "question": question,
        "top_k": top_k,
        "disease": disease,
        "topic": topic
    }

    print(f"Question: {question}")
    print(f"Disease: {disease}")
    print(f"Topic: {topic}")
    print(f"Top K: {top_k}")

    try:
        response = requests.post(
            f"{BASE_URL}/retrieve",
            json=request_body,
            timeout=120
        )

        print(f"HTTP status: {response.status_code}")

        if not response.text.strip():
            print("❌ Empty response from retrieval service")
            return

        data = response.json()

        print(f"Retrieved chunks: {len(data.get('chunks', []))}")
        print(f"Unique sources: {data.get('source_count', 0)}")
        print(
            f"Has relevant context: "
            f"{data.get('has_relevant_context', False)}"
        )

        chunks = data.get("chunks", [])

        for index, chunk in enumerate(chunks, start=1):
            print(f"\n#{index}")

            print(
                f"  Document: "
                f"{chunk.get('document', 'N/A')}"
            )

            print(
                f"  Document Path: "
                f"{chunk.get('documentPath', 'N/A')}"
            )

            print(
                f"  Disease: "
                f"{chunk.get('disease', 'N/A')}"
            )

            print(
                f"  Topic: "
                f"{chunk.get('topic', 'N/A')}"
            )

            print(
                f"  Section: "
                f"{chunk.get('section', 'N/A')}"
            )

            print(
                f"  Score: "
                f"{float(chunk.get('score', 0)):.6f}"
            )

            text = chunk.get("text", "")

            preview = text[:400].replace("\n", " ")

            print(f"  Text: {preview}...")

        sources = data.get("sources", [])

        if sources:
            print("\nSources:")

            for source in sources:
                print(
                    f"  - "
                    f"{source.get('document', 'N/A')} | "
                    f"{source.get('disease', 'N/A')} | "
                    f"{source.get('topic', 'N/A')} | "
                    f"{source.get('section', 'N/A')}"
                )

        context = data.get("context", "")

        print("\nContext preview:")
        print(context[:1000])

        print("\n✅ Retrieval request completed")

    except requests.exceptions.ConnectionError:
        print(
            "❌ Could not connect to FastAPI. "
            "Make sure the server is running on port 8000."
        )

    except requests.exceptions.Timeout:
        print("❌ Retrieval request timed out.")

    except requests.exceptions.HTTPError as error:
        print(f"❌ HTTP error: {error}")

    except ValueError:
        print("❌ FastAPI returned invalid JSON.")
        print(f"Raw response: {response.text}")

    except Exception as error:
        print(f"❌ Retrieval test failed: {error}")


def main():
    print("Testing Lymphoma RAG FastAPI service")

    # 1. Health check
    test_health()

    # 2. NHL biomarker question
    test_retrieve(
        question="What biomarkers influence treatment selection?",
        disease="NHL",
        topic=None
    )

    # 3. AML biomarker question
    test_retrieve(
        question="What biomarkers influence treatment selection?",
        disease="AML",
        topic=None
    )

    # 4. NHL treatment + topic filter
    test_retrieve(
        question="What are the important treatment options?",
        disease="NHL",
        topic="Treatment Modalities"
    )

    # 5. Broad question with no disease selected
    test_retrieve(
        question="What are the main treatment options?",
        disease=None,
        topic=None
    )


if __name__ == "__main__":
    main()