import { getEmbedding } from "./embeddingService.js";

async function test() {
  try {
    const sample = "What are the treatment options for lymphoma?";
    const emb = await getEmbedding(sample);

    console.log("\nEmbedding generation complete.");
    console.log(`Dimension: ${emb.length}`);
    console.log("First 10 values:", emb.slice(0, 10).map((v) => v.toFixed(6)));
  } catch (err) {
    console.error("Embedding test failed:", err);
  }
}

test();
