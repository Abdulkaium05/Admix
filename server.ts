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

  // Candidate models from @google/genai guidelines
  const CANDIDATE_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  // Helper for resilient generation with retries on transient 503/429 spikes
  async function callGeminiWithFallback(
    client: GoogleGenAI,
    prompt: string,
    systemInstruction?: string,
    temperature: number = 0.4
  ): Promise<string | null> {
    for (const model of CANDIDATE_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              ...(systemInstruction ? { systemInstruction } : {}),
              temperature,
            },
          });
          const text = response?.text?.trim();
          if (text) {
            return text;
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isTransient =
            err?.status === 503 ||
            err?.code === 503 ||
            errMsg.includes("503") ||
            errMsg.includes("high demand") ||
            errMsg.includes("UNAVAILABLE") ||
            err?.status === 429 ||
            err?.code === 429 ||
            errMsg.includes("429") ||
            errMsg.includes("RESOURCE_EXHAUSTED");

          if (isTransient && attempt === 0) {
            // Wait briefly before retrying model
            await new Promise((resolve) => setTimeout(resolve, 600));
            continue;
          }
          // Move to next candidate model
          break;
        }
      }
    }
    return null;
  }

  // Domain-specific intelligent fallback for DUET admission topics
  function getSmartFallbackAnswer(question: string, language: string = "bn"): string {
    const qLower = question.toLowerCase();

    if (language === "bn") {
      let specificTopicAdvice = "";
      if (qLower.includes("সার্ভে") || qLower.includes("survey") || qLower.includes("লেভেলিং") || qLower.includes("লেভেল")) {
        specificTopicAdvice = `\n\n📌 **সার্ভেয়িং ফোকাস পয়েন্ট:**\n- লেভেলিংয়ের ক্ষেত্রে $RL = HI - FS$ এবং $HI = BM + BS$ সূত্র মনে রাখুন।\n- থিওডোলাইট, ট্রাভার্সিং এবং কম্পাস কারেকশন (W.C.B & R.B) সংক্রান্ত অংকগুলো ডুয়েটের জন্য খুব গুরুত্বপূর্ণ।`;
      } else if (qLower.includes("ম্যাথ") || qLower.includes("গণিত") || qLower.includes("ইন্টিগ্রেশন") || qLower.includes("ক্যালকুলাস") || qLower.includes("ডিফারেনশিয়াল")) {
        specificTopicAdvice = `\n\n📌 **গণিত ফোকাস পয়েন্ট:**\n- ক্যালকুলাসের লিমিট, ম্যাক্সিমা-মিনিমা এবং ডেফিনিট ইন্টিগ্রেশনের স্ট্যান্ডার্ড সূত্র নিয়মিত প্র্যাকটিস করুন।\n- স্থানাঙ্ক জ্যামিতি (সরলরেখা ও বৃত্ত) এবং ম্যাট্রিক্স-নির্ণায়ক থেকে প্রতি বছর ডুয়েটে প্রশ্ন আসে।`;
      } else if (qLower.includes("পদার্থ") || qLower.includes("physics") || qLower.includes("বলবিদ্যা") || qLower.includes("আলো") || qLower.includes("থার্মো")) {
        specificTopicAdvice = `\n\n📌 **পদার্থবিজ্ঞান ফোকাস পয়েন্ট:**\n- নিউটনের গতিসূত্র, কাজ-ক্ষমতা-শক্তি এবং ঘর্ষণ সংক্রান্ত বলবিদ্যার ম্যাথগুলো স্পষ্ট ডায়াগ্রাম এঁকে সমাধান করুন।\n- তাপগতিবিদ্যার প্রথম ও দ্বিতীয় সূত্র এবং জ্যামিতিক আলোকবিজ্ঞানের লেন্স ও প্রিজম সূত্রগুলো আয়ত্তে রাখুন।`;
      } else if (qLower.includes("রসায়ন") || qLower.includes("chemistry") || qLower.includes("জৈব") || qLower.includes("পর্যায়")) {
        specificTopicAdvice = `\n\n📌 **রসায়ন ফোকাস পয়েন্ট:**\n- গ্যাস সূত্র ($PV = nRT$), মোলারিটি ও স্টয়কিওমেট্রি গাণিতিক সমস্যাগুলোর একক সতর্কতার সাথে রূপান্তর করুন।\n- পর্যায় সারণির সাধারণ ধর্ম এবং রাসায়নিক বন্ধনের মূল ধারণা স্পষ্ট রাখুন।`;
      } else if (qLower.includes("ইংরেজি") || qLower.includes("english") || qLower.includes("grammar") || qLower.includes("preposition")) {
        specificTopicAdvice = `\n\n📌 **ইংরেজি ফোকাস পয়েন্ট:**\n- Appropriate Preposition, Subject-Verb Agreement, Voice and Narration পরিবর্তনের নিয়মগুলো নিয়মিত রিভিশন দিন।\n- সিনোনিম ও অ্যান্টোনিম প্রতিদিন ৫-১০টি করে মুখস্থ করে খাতায় নোট রাখুন।`;
      } else if (qLower.includes("রুটিন") || qLower.includes("পড়াশোনা") || qLower.includes("সময়") || qLower.includes("পরামর্শ") || qLower.includes("plan")) {
        specificTopicAdvice = `\n\n📌 **স্টাডি প্ল্যানিং টিপস:**\n- প্রতিদিন ডিপার্টমেন্ট ও নন-ডিপার্টমেন্ট উভয় বিষয়ের জন্য সমান ভারসাম্য বজায় রাখুন।\n- আগেরদিন রাতে টাস্ক প্ল্যানারে পরের দিনের সুনির্দিষ্ট টপিকগুলো নোট করে রাখুন।`;
      }

      return `**[ডুয়েট এআই মেন্টর সহায়তা নোট]**\n\n**আপনার অনুসন্ধান:** "${question}"\n\n💡 **এডমিশন গাইডলাইন:**\n- প্রশ্নের মূল থিওরি ও স্ট্যান্ডার্ড ফর্মুলাগুলো ধাপে ধাপে প্রয়োগ করুন।\n- ক্যালকুলেটরে হিসাব করার সময় এককের সঙ্গতি (SI / MKS / FPS) যাচাই করুন।${specificTopicAdvice}\n\n*(সার্ভারে এআই মডেলের উচ্চ চাহিদার কারণে এটি তাৎক্ষণিক মেন্টর নোট হিসেবে পরিবেশন করা হয়েছে। পুনরায় জিজ্ঞাসা করলে লাইভ বিশ্লেষণ দেখতে পাবেন।)*`;
    } else {
      return `**[DUET AI Mentor Note]**\n\n**Your Question:** "${question}"\n\n💡 **Preparation Guidelines:**\n- Focus on foundational theories, clear derivation steps, and past DUET entrance questions.\n- Pay careful attention to unit conversions (SI system) and neat diagram sketches in Civil engineering problems.\n\n*(Instant mentor advice provided. Try again for extended live analysis.)*`;
    }
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
          answer: getSmartFallbackAnswer(question, language),
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

      const answerText = await callGeminiWithFallback(client, prompt, systemInstruction, 0.4);

      if (answerText) {
        res.json({
          answer: answerText,
          isFallback: false,
        });
      } else {
        // Return context-aware mentor guidance when models undergo temporary spike
        res.json({
          answer: getSmartFallbackAnswer(question, language),
          isFallback: true,
        });
      }
    } catch (err: any) {
      const language = req.body?.language || "bn";
      const question = req.body?.question || "";
      res.json({
        answer: getSmartFallbackAnswer(question, language),
        isFallback: true,
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

      const translated = await callGeminiWithFallback(client, prompt, undefined, 0.2);

      res.json({ translatedText: translated || text });
    } catch (_err) {
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
