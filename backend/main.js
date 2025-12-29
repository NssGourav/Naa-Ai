import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app = express();
app.use(express.json())
//cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
function getModel() {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY_NOT_CONFIGURED");
  }
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/api/content", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }
    const model = getModel();
    const result = await model.generateContent(question.trim());
    const text = result.response.text();

    return res.json({ result: text });

  } catch (err) {
    console.error("AI Error:", err);

    const msg = err.message || "";

    if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")){
      return res.status(429).json({
        error: "AI quota exceeded. Please try again later."
      });
    }
    if (msg.includes("API_KEY_NOT_CONFIGURED")) {
      return res.status(500).json({
        error: "Server misconfiguration"
      });
    }
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
