import { qdrant, COLLECTION_NAME } from "./qdrantService.js";

async function ensureCollection() {
  try {
    const collections = await qdrant.getCollections();

    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (exists) {
      console.log(`Collection already exists: ${COLLECTION_NAME}`);
      return;
    }

    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });

    console.log(`Created collection: ${COLLECTION_NAME}`);
  } catch (err) {
    console.error("Error setting up Qdrant collection:", err);
  }
}

ensureCollection();
