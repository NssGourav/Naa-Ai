import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
dotenv.config({ quiet: true });
const app = express()

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin

  if (process.env.NODE_ENV === 'production' || !origin) {
    res.header('Access-Control-Allow-Origin', '*')
  } else {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
    } else {
      res.header('Access-Control-Allow-Origin', '*')
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())
app.use(bodyParser.json())

app.get("/",(req,res)=>{
    res.json({message: "Hello World"})
})

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generate = async (prompt) => {
  try {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = result.response.text();
    console.log('Generated response:', text);
    return text;
  } catch (err) {
    console.error('Error generating content:', err);
    throw err; 
  }
};

app.post('/api/content', async (req, res) => {
  try {
    if (!req.body || !req.body.question) {
      return res.status(400).send({ "error": "Question is required" });
    }

    const question = req.body.question.trim();
    if (question.length === 0) {
      return res.status(400).send({ "error": "Question cannot be empty" });
    }
    if (!process.env.API_KEY) {
      console.error('API_KEY is not configured');
      return res.status(500).send({ "error": "Server configuration error" });
    }

    const result = await generate(question);
    
    if (!result) {
      return res.status(500).send({ "error": "Failed to generate response" });
    }

    res.send({ "result": result });
  } catch (err) {
    console.error('Error in /api/content:', err);
    const errorMessage = err.message || "Internal server error";
    res.status(500).send({ "error": errorMessage });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is ON running on port ${PORT}`);
});


