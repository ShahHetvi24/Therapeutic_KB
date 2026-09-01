import { qdrant, COLLECTION_NAME } from "./qdrantService.js";

async function testConnection() {
  try {
    console.log("Testing Qdrant connection...\n");

    const collections = await qdrant.getCollections();

    console.log("Connected to Qdrant successfully!");
    console.log("\nAvailable collections:");

    if (collections.collections.length === 0) {
      console.log("No collections found yet.");
    } else {
      collections.collections.forEach((collection) => {
        console.log(`- ${collection.name}`);
      });
    }

    console.log(`\nConfigured collection name: ${COLLECTION_NAME}`);

  } catch (error) {
    console.error("\nQdrant connection failed!");
    console.error("Error:", error.message);

    process.exit(1);
  }
}

testConnection();