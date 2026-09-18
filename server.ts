import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // Initialize Gemini AI client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Support Endpoint for DUET Admission questions
  app.post("/api/gemini/ask", async (req, res) => {
    try {
      const { question, subject, language = "bn" } = req.body;

      if (!question || typeof question !== "string") {
        res.status(400).json({ error: "প্রশ্ন প্রদান করা আবশ্যক (Question is required)" });
        return;
      }

      const client = getGeminiClient();
      if (!client) {
        // Helpful fallback response when API key is pending
        res.json({
          answer: language === "bn"
            ? `[ডুয়েট অফলাইন সহায়িকা]\nবিষয়: ${subject || "সাধারণ"}\nআপনার প্রশ্ন: "${question}"\n\nপরামর্শ: DUET ভর্তি পরীক্ষার জন্য মূল সূত্র ও বিগত বছরের প্রশ্ন ভালো করে চর্চা করুন। (অনলাইন AI পূর্ণ বিশ্লেষণের জন্য সার্ভারে GEMINI_API_KEY সক্রিয় করুন)।`
            : `[DUET Offline Guide]\nSubject: ${subject || "General"}\nYour Question: "${question}"\n\nTip: Practice standard DUET past questions and core formulas thoroughly.`,
          isFallback: true,
        });
        return;
      }

      const systemInstruction = `You are the expert DUET (Dhaka University of Engineering & Technology) Admission Preparation Mentor and Tutor.
The user is preparing for the highly competitive DUET admission test (Diploma to B.Sc. Engineering).
The exam covers:
1. Department Subjects: Civil Engineering (RCC, Structural Mechanics, Hydraulics, Surveying, Soil Mechanics, Highway/Transportation, Building Construction, Estimating).
2. Non-Department Subjects: Mathematics (Calculus, Trigonometry, Coordinate Geometry, Algebra, Matrix), Physics (Mechanics, Optics, Thermodynamics, Electricity, Modern Physics), Chemistry (Periodic Table, Gas Laws, Organic Chemistry, Chemical Bonding, Stoichiometry), and English (Grammar, Preposition, Vocabulary, Error correction).

Guidelines:
- Provide clear, accurate, step-by-step explanations.
- If asked a mathematical, physics, or civil formula/problem, provide the step-by-step derivation/solution and state the relevant formulas clearly.
- If the user asks in Bengali, reply primarily in clear academic Bengali with technical terms in English/Bengali as common in DUET coaching.
- If the user asks in English or language is requested as 'en', reply in clear English.
- Keep explanations structured, concise, and focused on DUET admission exam patterns.`;

      const prompt = `Subject Area: ${subject || "General / DUET Admission"}\nPreferred Language: ${language === "en" ? "English" : "Bengali"}\n\nStudent's Question:\n${question}`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({
        answer: response.text || (language === "bn" ? "উত্তর প্রদান করা সম্ভব হয়নি।" : "Could not generate response."),
        isFallback: false,
      });
    } catch (err: any) {
      console.error("Gemini API Error:", err?.message || err);
      res.status(500).json({
        error: "এআই সার্ভিসে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।",
        details: err?.message,
      });
    }
  });

  // Translation / bilingual assistance endpoint
  app.post("/api/gemini/translate", async (req, res) => {
    try {
      const { text, targetLang = "en" } = req.body;
      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }

      const client = getGeminiClient();
      if (!client) {
        res.json({ translatedText: text });
        return;
      }

      const prompt = `Translate the following academic / engineering question or options from ${targetLang === "en" ? "Bengali to English" : "English to Bengali"}. Maintain scientific and engineering terminology precisely. Only return the translated text with no extra conversational commentary.\n\nText:\n${text}`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ translatedText: response.text?.trim() || text });
    } catch (err) {
      res.json({ translatedText: req.body.text });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DUET Quiz Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
