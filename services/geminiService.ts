import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the client. The API key is injected via the environment.
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

// Only attempt to initialize if a key exists
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.warn("Gemini API Key is missing. AI features will be disabled.");
}

export const askGeminiTutor = async (
  question: string,
  context: string
): Promise<string> => {
  if (!ai) {
    return "The AI Tutor is currently unavailable because the API Key is missing. Please configure the API_KEY in your environment variables or GitHub Secrets.";
  }

  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `
You are an expert, friendly Apache Kafka instructor teaching a complete beginner.
Your goal is to explain concepts simply, using analogies (like postal systems, logs, queues).
The user is interacting with a visual playground containing Producers, Topics (with Partitions), and Consumers.

Current Simulation Context:
${context}

Rules:
1. Keep answers concise (under 3 paragraphs).
2. Use markdown for formatting.
3. If the user asks about the simulation, refer to the "Current Simulation Context".
4. Be encouraging!
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: question }]
        }
      ],
      config: {
        systemInstruction,
      }
    });

    return response.text || "I couldn't generate an answer right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to my brain (the API). Please try again later.";
  }
};
