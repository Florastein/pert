import { GoogleGenAI, Type } from "@google/genai";
import type { Intent } from '../types';

function getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey });
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    intentName: {
      type: Type.STRING,
      description: 'The name of the matched intent, or "default" if no intent matches.',
    },
    response: {
      type: Type.STRING,
      description: 'The response associated with the matched intent.',
    },
  },
  required: ['intentName', 'response'],
};

const intentGenerationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'A short, descriptive name for the intent (e.g., "Pricing Inquiry").',
        },
        trainingPhrases: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'An array of 3-5 example questions a user might ask for this intent.',
        },
        response: {
          type: Type.STRING,
          description: 'The detailed answer to the user\'s question, based on the provided text.',
        },
      },
      required: ['name', 'trainingPhrases', 'response'],
    },
};


export const generateIntentsFromText = async (
    text: string
): Promise<Omit<Intent, 'id'>[]> => {
     try {
        const model = 'gemini-2.5-flash';
        const ai = getAI();

        const systemInstruction = `You are an AI assistant that specializes in creating chatbot intents from raw text.
Your task is to analyze the provided text and generate a list of intents. Each intent must consist of:
1.  A concise 'name' that summarizes the intent.
2.  A list of 'trainingPhrases' (3-5 examples) that a user might say to trigger this intent. These phrases should be varied.
3.  A 'response' that directly and accurately answers the user's likely question, using only information from the provided text.

Extract the most relevant and distinct pieces of information to form these intents. Do not invent information. The entire output must be ONLY the JSON array specified in the schema.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: `Here is the text to analyze:\n\n---\n\n${text}`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: intentGenerationSchema,
                temperature: 0.2, 
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (Array.isArray(result)) {
            return result.filter(item => item.name && item.trainingPhrases && item.response);
        }
        return [];

    } catch (error) {
        console.error("Error generating intents from text:", error);
        throw new Error("Failed to generate intents. The AI model may have had an issue processing the content. Please try again with different or simplified text.");
    }
};

export const getBotResponse = async (
    userInput: string,
    intents: Intent[],
    defaultResponse: string,
    context?: string
): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const ai = getAI();

        const systemInstruction = `You are an expert intent classification engine for a chatbot. Your task is to analyze the user's input and determine which of the predefined intents it matches.
- You will be given a list of intents, each with a name, training phrases, and a specific response.
- You will also be given a default response to use when no intent matches confidently.
- Analyze the \`userInput\`.
- Compare it against the \`trainingPhrases\` for each intent.
- If you find a clear match, return a JSON object with the \`intentName\` and \`response\` of the matched intent.
- If there is no clear match, or if the input is ambiguous, return a JSON object containing the \`intentName\` as 'default' and the provided \`defaultResponse\` as the \`response\`.
- Your entire output must be ONLY the JSON object specified in the schema, with no additional text, explanations, or markdown formatting.`;

        const messageWithContext = context && context.trim()
            ? `Use the following private context when answering. If the context is unrelated, say you don't know and ask a follow-up.\n\n[CONTEXT]\n${context}\n\n[QUESTION]\n${userInput}`
            : userInput;
        const promptPayload = {
            intents: intents.map(i => ({ name: i.name, trainingPhrases: i.trainingPhrases, response: i.response })),
            defaultResponse: defaultResponse,
            userInput: messageWithContext,
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: JSON.stringify(promptPayload),
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.response || defaultResponse;

    } catch (error) {
        console.error("Error getting bot response from Gemini:", error);
        return defaultResponse;
    }
};