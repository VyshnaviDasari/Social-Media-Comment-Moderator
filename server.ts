import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to pause execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a callback returning a Promise and retries it on transient errors
 * with an exponential backoff factor and randomized jitter.
 */
async function callGeminiWithRetry<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 400
): Promise<T> {
  try {
    return await action();
  } catch (err: any) {
    const errStatus = err.status || err.statusCode;
    const isTransient =
      errStatus === 503 ||
      errStatus === 429 ||
      String(err.message || "").toUpperCase().includes("503") ||
      String(err.message || "").toUpperCase().includes("UNAVAILABLE") ||
      String(err.message || "").toUpperCase().includes("429") ||
      String(err.message || "").toUpperCase().includes("LIMITS");

    if (isTransient && retries > 0) {
      // Add a randomized jitter between 0ms and 150ms to mitigate synchronized retries
      const jitter = Math.random() * 150;
      const nextDelay = delayMs * 2 + jitter;
      console.warn(
        `[Gemini Auto Retry] Warning: Transient API error detected ("${err.message || err}"). Automatically retrying in ${Math.round(nextDelay)}ms... (${retries} attempts left)`
      );
      await sleep(nextDelay);
      return callGeminiWithRetry(action, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

// In-memory simulation stores logs and comment stats
interface CommentLog {
  id: string;
  timestamp: string;
  text: string;
  mode: string;
  isNegative: boolean;
  severity: number;
  sentiment: "positive" | "neutral" | "negative";
  category: string;
  explanation: string;
  suggestion: string;
  moderator: string;
  executionTimeMs: number;
}

const moderationHistory: CommentLog[] = [
  {
    id: "pre-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    text: "Wow! The interface of this library looks incredibly sleek. Very cool deployment steps.",
    mode: "gemini",
    isNegative: false,
    severity: 5,
    sentiment: "positive",
    category: "positive_feedback",
    explanation: "Explicitly expresses enthusiasm and compliments the interface sleekness.",
    suggestion: "",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 142
  },
  {
    id: "pre-2",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    text: "Can you provide some examples of using this inside a Kubernetes environment? The docs seem sparse.",
    mode: "heuristics",
    isNegative: false,
    severity: 15,
    sentiment: "neutral",
    category: "constructive_critique",
    explanation: "Requests additional examples regarding cluster setups; normal constructive inquiry.",
    suggestion: "",
    moderator: "Local Sentiment Heuristics",
    executionTimeMs: 2
  },
  {
    id: "pre-3",
    timestamp: new Date(Date.now() - 2500000).toISOString(),
    text: "This is pure garbage. Sucks so bad, whoever wrote this code is a total idiot.",
    mode: "keywords",
    isNegative: true,
    severity: 98,
    sentiment: "negative",
    category: "harassment",
    explanation: "Contains blacklisted terms 'garbage', 'sucks', 'idiot' and uses hostile ad hominem language.",
    suggestion: "Rephrase with objective metrics: 'I found several issues with this release in comparison to other libraries.'",
    moderator: "Keyword Filter",
    executionTimeMs: 1
  },
  {
    id: "pre-4",
    timestamp: new Date(Date.now() - 2000000).toISOString(),
    text: "Is there any support for offline compilation? That would be useful for restricted environments.",
    mode: "gemini",
    isNegative: false,
    severity: 8,
    sentiment: "neutral",
    category: "constructive_critique",
    explanation: "Constructive feedback posing a feature request.",
    suggestion: "",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 180
  },
  {
    id: "pre-5",
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    text: "CLICK HERE FOR THE BEST BITCOIN ENHANCEMENT BOT $$$ EASY MONEY NOW!!!",
    mode: "heuristics",
    isNegative: true,
    severity: 85,
    sentiment: "negative",
    category: "spam",
    explanation: "Aggressive all-caps text promising quick money, typical spam format.",
    suggestion: "",
    moderator: "Local Sentiment Heuristics",
    executionTimeMs: 3
  }
];

// Local Keyword-based Moderation Logic
function handleKeywordModeration(text: string, customKeywords: string[]): CommentLog {
  const startTime = Date.now();
  const defaultKeywords = ["garbage", "trash", "sucks", "idiot", "worst", "shit", "fuck", "hate", "scam", "dumb", "useless", "retard", "asshole"];
  const filterList = Array.from(new Set([...defaultKeywords, ...customKeywords].map(k => k.toLowerCase())));
  
  const textLower = text.toLowerCase();
  const matchedWords: string[] = [];
  
  for (const word of filterList) {
    if (word.trim() && textLower.includes(word)) {
      matchedWords.push(word);
    }
  }

  const isNegative = matchedWords.length > 0;
  // Calculate a mock severity based on matched words ratio and ALL CAPS count
  const severity = isNegative ? Math.min(60 + (matchedWords.length * 10), 99) : 0;
  
  return {
    id: "kw-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    text,
    mode: "keywords",
    isNegative,
    severity,
    sentiment: isNegative ? "negative" : "neutral",
    category: isNegative ? "profanity" : "neutral_unrelated",
    explanation: isNegative 
      ? `Blocked due to matched keyword(s): [${matchedWords.join(", ")}].`
      : "No blacklisted keywords detected.",
    suggestion: isNegative 
      ? "Avoid using highly emotive dismissive expressions. State constructive criticism instead."
      : "",
    moderator: "Keyword Filter",
    executionTimeMs: Date.now() - startTime
  };
}

// Local Sentiment Heuristics Moderation Logic
function handleHeuristicsModeration(text: string, customKeywords: string[]): CommentLog {
  const startTime = Date.now();
  
  // Run keyword check first as a baseline
  const kwResult = handleKeywordModeration(text, customKeywords);
  if (kwResult.isNegative) {
    return {
      ...kwResult,
      id: "heur-" + Math.random().toString(36).substring(2, 9),
      mode: "heuristics",
      moderator: "Local Sentiment Heuristics",
      executionTimeMs: Date.now() - startTime
    };
  }

  // Simple heuristic scoring
  const negativeSignals = ["bad", "poor", "difficult", "confused", "issue", "error", "annoyed", "wrong", "broke", "fail", "slow", "heavy", "terrible", "weird"];
  const positiveSignals = ["great", "awesome", "perfect", "good", "nice", "love", "thanks", "thank you", "helpful", "amazing", "smooth", "easy", "speedy"];
  const spamSignals = ["$$$", "crypto", "free money", "best prize", "earn money", "whatsapp", "telegram channel", "click here"];

  const textLower = text.toLowerCase();
  let negCount = 0;
  let posCount = 0;
  let spamCount = 0;

  for (const sig of negativeSignals) {
    if (textLower.includes(sig)) negCount++;
  }
  for (const sig of positiveSignals) {
    if (textLower.includes(sig)) posCount++;
  }
  for (const sig of spamSignals) {
    if (textLower.includes(sig)) spamCount++;
  }

  // All caps check
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const allCapsCount = words.filter(w => w === w.toUpperCase() && /^[A-Z]+$/.test(w)).length;
  const isAllCapsShouting = words.length > 0 && (allCapsCount / words.length) > 0.6;

  let isNegative = false;
  let severity = 0;
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  let category = "neutral_unrelated";
  let explanation = "Content appears neutral.";
  let suggestion = "";

  if (spamCount > 0) {
    isNegative = true;
    severity = Math.min(50 + (spamCount * 15), 90);
    sentiment = "negative";
    category = "spam";
    explanation = "Flagged by local heuristics: promotional links/earning triggers detected.";
  } else if (negCount > posCount) {
    isNegative = true;
    severity = Math.min(25 + (negCount - posCount) * 15 + (isAllCapsShouting ? 20 : 0), 85);
    sentiment = "negative";
    category = "constructive_critique"; // Local heuristics categorizes negative tone as reviewable critique
    explanation = `Flagged by Local Heuristics: Tone has negative sentiment pattern (${negCount} negative vs ${posCount} positive tokens).`;
    suggestion = "Consider introducing more objective framing to keep the conversation productive.";
    if (isAllCapsShouting) {
      explanation += " Appears to be shouting in ALL CAPS.";
    }
  } else if (posCount > negCount) {
    sentiment = "positive";
    category = "positive_feedback";
    explanation = "Local Heuristics detected mostly positive sentiment signals.";
  } else if (isAllCapsShouting) {
    isNegative = true;
    severity = 55;
    sentiment = "negative";
    category = "constructive_critique";
    explanation = "Flagged by local heuristics: Over 60% of words are in shouting uppercase style.";
    suggestion = "Avoid excessive capital letters as it translates to hostile tone.";
  }

  return {
    id: "heur-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    text,
    mode: "heuristics",
    isNegative,
    severity,
    sentiment,
    category,
    explanation,
    suggestion,
    moderator: "Local Sentiment Heuristics",
    executionTimeMs: Date.now() - startTime
  };
}

// API Routes

// Retrieve baseline moderation history
app.get("/api/history", (req, res) => {
  res.json({ history: moderationHistory });
});

// Clear moderation logs
app.post("/api/history/clear", (req, res) => {
  moderationHistory.length = 0;
  res.json({ success: true, history: moderationHistory });
});

app.post("/api/moderate", async (req: any, res: any) => {
  const { text, mode, customKeywords, threshold } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Comment text cannot be empty." });
  }

  const selectedMode = mode || "heuristics";
  const limitThreshold = threshold === undefined ? 50 : threshold;
  const keywordsList = customKeywords || [];

  if (selectedMode === "keywords") {
    const result = handleKeywordModeration(text, keywordsList);
    moderationHistory.unshift(result);
    return res.json(result);
  }

  if (selectedMode === "heuristics") {
    const result = handleHeuristicsModeration(text, keywordsList);
    moderationHistory.unshift(result);
    return res.json(result);
  }

  // Selected Mode: Gemini LLM Shield
  const startTime = Date.now();
  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are an expert social media and community moderation bot.
Analyze the sentiment and toxicity level of the submitted user comment and classify it.
You must be precise in distinguishing between constructive critique/unhappy customers versus genuine hostility, harassment, spam, and hate speech.
You must return a structured JSON response following the specified schema.

Multilingual Support:
- You must support Indian regional languages, especially Telugu (తెలుగు)!
- If the comment is in Telugu, understand the meaning and context completely.
- If the comment is toxic and flagged, provide the 'suggestion' in natural Telugu script so the user can easily rephrase and re-write their feedback constructively. Keep the Telugu suggestion positive, friendly, and respectful.

Criteria for attributes:
- isNegative: Whether the toxicity or negativity severity is equal to or higher than the threshold ${limitThreshold} (on a scale of 0-100), OR if it should be hidden due to being hate speech, extreme harassment, profanity, or spam.
- severity: Numeric score from 0 (completely friendly/relevant) to 100 (extreme harassment, toxic, slurs).
- sentiment: Choose exactly 'positive', 'neutral', or 'negative'.
- category: Categorize the text. Choose exactly one of the following strings:
    * 'harassment' (hostile attacks on personas, bullying)
    * 'hate_speech' (discriminatory or derogatory statements against groups)
    * 'profanity' (swear words or offensive slurs)
    * 'constructive_critique' (disappointed or critical feedback but keeps a civil tone)
    * 'spam' (advertising, links, bot chatter, gibberish)
    * 'positive_feedback' (praising, helpful, or constructive compliments)
    * 'neutral_unrelated' (normal question, chit-chat, off-topic but civil)
- explanation: A clear 1-2 sentence explanation of *why* you made this classification, referencing the specific tone or phrases used.
- suggestion: If categorized as harassment, hate speech, constructive critique, or profanity, provide a 1-sentence prompt suggestion on how the user could rephrase their critique more productively without hostility. If positive or neutral, leave empty. For Telugu inputs, make sure this suggestion is written in sweet and constructive Telugu script.`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Submitted User Comment to Analyze: "${text}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isNegative: {
                type: Type.BOOLEAN,
                description: "Whether the text should be hidden or filtered."
              },
              severity: {
                type: Type.INTEGER,
                description: "Score from 0 (perfect) to 100 (highly toxic/negative)."
              },
              sentiment: {
                type: Type.STRING,
                description: "Must be 'positive', 'neutral', or 'negative'."
              },
              category: {
                type: Type.STRING,
                description: "Must be one of the specified categories."
              },
              explanation: {
                type: Type.STRING,
                description: "Succinct human-readable explanation of the judgment."
              },
              suggestion: {
                type: Type.STRING,
                description: "A constructive, clean prompt of how to reframe negative remarks."
              }
            },
            required: ["isNegative", "severity", "sentiment", "category", "explanation", "suggestion"]
          }
        }
      })
    );

    const payloadText = response.text;
    if (!payloadText) {
      throw new Error("No response text yielded from Gemini API.");
    }

    const geminiSpec = JSON.parse(payloadText.trim());
    
    // Compute isNegative based on the severity threshold in the active request if necessary
    const computedIsNegative = geminiSpec.severity >= limitThreshold || 
                               ["harassment", "hate_speech", "profanity", "spam"].includes(geminiSpec.category);

    const result: CommentLog = {
      id: "gemini-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      text,
      mode: "gemini",
      isNegative: computedIsNegative,
      severity: geminiSpec.severity,
      sentiment: geminiSpec.sentiment,
      category: geminiSpec.category,
      explanation: geminiSpec.explanation,
      suggestion: geminiSpec.suggestion,
      moderator: "Gemini LLM Shield",
      executionTimeMs: Date.now() - startTime
    };

    moderationHistory.unshift(result);
    return res.json(result);

  } catch (error: any) {
    console.error("Gemini moderation error:", error);
    
    // Graceful fallback to heuristics if Gemini is misconfigured or has missing key
    const fallbackResult = handleHeuristicsModeration(text, keywordsList);
    const hasNoKey = !process.env.GEMINI_API_KEY;

    return res.json({
      ...fallbackResult,
      moderator: "Local Sentiment Heuristics (AI Key Missing Fallback)",
      explanation: hasNoKey 
        ? "Notice: Running on local simulation rules. To unlock live deep AI moderation, set your GEMINI_API_KEY in the Secrets panel."
        : `Gemini server-side error: ${error.message}. Ran local simulation fallback instead.`
    });
  }
});

// Start server setup with Vite
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Social Guard Backend] Running on http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("Failure while launching full-stack server:", err);
});
