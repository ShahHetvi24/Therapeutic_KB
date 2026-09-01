from embedding_service import generate_embedding, get_embedding_dimension


def main():
    question = "What are the treatment options for lymphoma?"

    try:
        dimension = get_embedding_dimension()
        print(f"Model embedding dimension: {dimension}")

        embedding = generate_embedding(question)

        print("Embedding generated successfully.")
        print(f"Embedding dimension: {len(embedding)}")
        print("First 10 values:")
        print([round(value, 6) for value in embedding[:10]])

        assert len(embedding) == 384

        print("Dimension verification passed: 384")

    except Exception as error:
        print(f"Embedding test failed: {error}")


if __name__ == "__main__":
    main()