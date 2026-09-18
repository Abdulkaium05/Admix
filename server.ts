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
        res.json({
          answer: language === "bn"
            ? `**[ডুয়েট অফলাইন সহায়িকা]**\n\n**প্রশ্ন:** ${question}\n\n**পরামর্শ:** DUET ভর্তি পরীক্ষার জন্য মূল থিওরি, সূত্র ও বিগত বছরের প্রশ্ন ভালো করে চর্চা করুন। সার্ভারে এআই সক্রিয় করতে সেটিংস থেকে GEMINI_API_KEY নিশ্চিত করুন।`
            : `**[DUET Offline Guide]**\n\n**Question:** ${question}\n\n**Advice:** Master the foundational theories, formulas, and past DUET question patterns.`,
          isFallback: true,
        });
        return;
      }

      const systemInstruction = `You are the premier DUET (Dhaka University of Engineering & Technology) Admission Preparation Mentor, Academic Coach, and Tutor.
The student is preparing for the DUET admission test (Diploma to B.Sc. Engineering).
The exam structure covers:
1. Department Subjects: Civil Engineering (RCC, Structural Mechanics, Hydraulics, Surveying, Soil Mechanics, Highway/Transportation, Building Construction, Estimating).
2. Non-Department Subjects: Mathematics (Calculus, Trigonometry, Coordinate Geometry, Algebra, Matrices), Physics (Mechanics, Optics, Thermodynamics, Electricity, Modern Physics), Chemistry (Periodic Table, Gas Laws, Organic Chemistry, Chemical Bonding, Stoichiometry), and English (Grammar, Preposition, Vocabulary, Error correction).

Guidelines:
- Provide clear, accurate, step-by-step mathematical and conceptual explanations.
- If asked for formulas or derivations, write the formulas neatly with explanations of variables.
- Write in clean, supportive Bengali (with standard English technical terms where appropriate) or in English if requested.
- Use markdown formatting with bold headings, bullet points, and code blocks for math when helpful.
- Keep answers encouraging, student-friendly, and specifically tailored for DUET entrance success.`;

      const prompt = `Subject: ${subject || "DUET Admission Test"}\nPreferred Language: ${language === "en" ? "English" : "Bengali"}\n\nStudent Question:\n${question}`;

      // Try responsive models in order: gemini-3.6-flash, gemini-3.8-flash, gemini-flash-latest
      const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-flash-latest"];
      let answerText = "";
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.4,
            },
          });
          if (response.text) {
            answerText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} failed with:`, err?.message || err);
        }
      }

      if (answerText) {
        res.json({
          answer: answerText,
          isFallback: false,
        });
      } else {
        // If models are temporarily unreachable, provide an informative mentor answer
        res.json({
          answer: language === "bn"
            ? `**[ডুয়েট এআই মেন্টর প্রস্তুতি নোট]**\n\nআপনার প্রশ্ন: **${question}**\n\n📌 **গুরুত্বপূর্ণ পরামর্শ:**\n- ডুয়েট ভর্তি পরীক্ষায় সিভিল ও নন-ডিপার্টমেন্ট (ম্যাথ, পদার্থ, রসায়ন, ইংরেজি) প্রতিটি অংশের নম্বর সমানভাবে গুরুত্বপূর্ণ।\n- প্রতিদিন নিয়মিত স্টাডি টাইম ট্র্যাক করুন এবং বিগত বছরের প্রশ্ন সমাধান করুন।\n\n*(সার্ভিসটি পুনরায় চেষ্টা করলে পূর্ণাঙ্গ লাইভ বিশ্লেষণ পেয়ে যাবেন)*`
            : `**[DUET AI Mentor Note]**\n\nQuestion: **${question}**\n\nKey focus: Practice past DUET questions, core structural calculations, and calculus applications regularly.`,
          isFallback: true,
          error: lastError?.message,
        });
      }
    } catch (err: any) {
      console.error("Gemini API Route Error:", err?.message || err);
      res.status(500).json({
        error: "এআই সার্ভিসে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
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
