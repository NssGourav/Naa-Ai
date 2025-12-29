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

if (!process.env.API_KEY) {
  console.error('WARNING: API_KEY environment variable is not set!');
}
const genAI = process.env.API_KEY ? new GoogleGenerativeAI(process.env.API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

const generate = async (prompt) => {
  try {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }
    if (!model) {
      throw new Error('AI model is not initialized. Check API_KEY configuration.');
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = result.response.text();
    console.log('Generated response length:', text?.length || 0);
    return text;
  } catch (err) {
    console.error('Error generating content:', err);
    if (err.message?.includes('API_KEY')) {
      throw new Error('Invalid or missing API key');
    } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (err.message?.includes('model')) {
      throw new Error('Invalid model configuration');
    }
    throw err; 
  }
};

app.post('/api/content', async (req, res) => {
  try {
    console.log('Received request:', { hasBody: !!req.body, hasQuestion: !!req.body?.question });
    
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

    if (!model) {
      console.error('Model is not initialized');
      return res.status(500).send({ "error": "Server configuration error: AI model not initialized" });
    }

    console.log('Generating response for question:', question.substring(0, 50) + '...');
    const result = await generate(question);
    
    if (!result) {
      console.error('Generate function returned null/undefined');
      return res.status(500).send({ "error": "Failed to generate response" });
    }

    console.log('Successfully generated response');
    res.send({ "result": result });
  } catch (err) {
    console.error('Error in /api/content:', err);
    console.error('Error stack:', err.stack);
    const errorMessage = err.message || "Internal server error";
    res.status(500).send({ "error": errorMessage });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is ON running on port ${PORT}`);
});


