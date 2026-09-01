import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server folder
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

// Check if environment variables are loaded
if (!process.env.QDRANT_URL) {
  throw new Error(
    "QDRANT_URL is missing. Check your .env file location and configuration."
  );
}

if (!process.env.QDRANT_API_KEY) {
  throw new Error(
    "QDRANT_API_KEY is missing. Check your .env file."
  );
}

// Create Qdrant client
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION || "lymphoma_knowledge_base";

export { qdrant, COLLECTION_NAME };