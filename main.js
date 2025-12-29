import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
dotenv.config({ quiet: true });
const app = express()
app.use(express.json())
app.use(bodyParser.json())

app.get("/",(req,res)=>{
    res.json({message: "Hello World"})
})

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generate = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(result.response.text());
    return result.response.text();
  } catch (err) {
    console.log(err);
  }
};

app.post('/api/content', async (req, res) => {
  try {
    const data = req.body.question;
    const result = await generate(data);
    res.send({ "result": result });
  } catch (err) {
    console.log(err);
    res.status(500).send({ "error": "Internal server error" });
  }
});

app.listen(3000,()=>{
    console.log("Server is ON running on port 3000");
});


