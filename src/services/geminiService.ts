import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAIInstance = () => {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    
    // Check for missing, empty, or literal "undefined"/"null" strings
    if (!key || key === "" || key === "undefined" || key === "null") {
      const msg = "Gemini API key is missing from the build. Please ensure GEMINI_API_KEY is set in your GitHub Secrets and the deployment has finished successfully.";
      console.error(msg);
      throw new Error(msg);
    }
    
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  tone: "formal" | "casual" | "professional" | "neutral";
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage: string;
}

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a professional multilingual translator.
    Translate the provided text into ${request.targetLanguage}.
    
    Instructions:
    - Preserve the original meaning exactly.
    - Use natural, fluent phrasing (not word-for-word translation).
    - Match the tone: ${request.tone}.
    - If the sentence sounds awkward when translated literally, rewrite it naturally.
    - Keep it clean and easy to read.
  `;

  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { text: "Text to translate:" },
        { text: request.text }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedText: {
            type: Type.STRING,
            description: "The translated text.",
          },
          detectedLanguage: {
            type: Type.STRING,
            description: "The language detected from the source text.",
          },
        },
        required: ["translatedText", "detectedLanguage"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      translatedText: result.translatedText || "",
      detectedLanguage: result.detectedLanguage || "Unknown",
    };
  } catch (error) {
    console.error("Failed to parse translation response:", error);
    throw new Error("Translation failed. Please try again.");
  }
}

export interface EnhanceRequest {
  text: string;
  tone: string;
}

export interface EnhanceResponse {
  refinedText: string;
  improvements: string[];
}

export async function enhanceText(request: EnhanceRequest): Promise<EnhanceResponse> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert text editor and language enhancer. 
    Your task is to refine the provided text so that it is:
    - Clear, professional, and polished
    - Fluent and natural
    - Suitable for portfolio, formal, or professional use
    - Improved in tone, grammar, and readability without changing meaning
    - Concise where possible, but never lose important details

    Instructions:
    - Match the user's intended tone: ${request.tone}
    - Highlight subtle improvements in wording and phrasing.
    - Suggest alternative wordings if it improves clarity or professionalism.
  `;

  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { text: "Text to refine:" },
        { text: request.text }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedText: {
            type: Type.STRING,
            description: "The polished and enhanced version of the text.",
          },
          improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of specific improvements or alternative wordings suggested.",
          },
        },
        required: ["refinedText", "improvements"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      refinedText: result.refinedText || "",
      improvements: result.improvements || [],
    };
  } catch (error) {
    console.error("Failed to parse enhancement response:", error);
    throw new Error("Enhancement failed. Please try again.");
  }
}
