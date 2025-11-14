import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

export const generateChatResponse = async function* (prompt: string) {
  const chat = ai.chats.create({ model: textModel });
  const result = await chat.sendMessageStream({ message: prompt });
  for await (const chunk of result) {
    yield chunk.text;
  }
};

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string) => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: imageModel,
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Sorry, I couldn't analyze the image. Please try again.";
  }
};

export const findSimilarContent = async (title: string): Promise<string> => {
    try {
        const prompt = `I just watched "${title}". Can you recommend 5 similar movies or TV shows? For each, provide a brief, one-sentence reason why it's a good recommendation. Format it as a simple list.`;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error finding similar content:", error);
        return "Sorry, I couldn't find recommendations at the moment. Please try again later.";
    }
};

// FIX: Added textToSpeech function to provide text-to-speech functionality as required by audioPlayerService.
export const textToSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};
