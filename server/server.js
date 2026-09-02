import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173" ||
      "https://6a97303a755b7b07c5c41972--therapeutickb.netlify.app/",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.static(clientDistPath));

// Mount chat API
app.use("/api", chatRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  if (
    (req.method !== "GET" && req.method !== "HEAD") ||
    req.path === "/api" ||
    req.path.startsWith("/api/")
  ) {
    return next();
  }

  return res.sendFile(path.join(clientDistPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✓ Therapeutic Knowledge Base Assistant Server`);
  console.log(`✓ Running on http://localhost:${PORT}`);
  console.log(`✓ Chat API: POST http://localhost:${PORT}/api/chat`);
  console.log(`✓ Health check: GET http://localhost:${PORT}/health\n`);
});