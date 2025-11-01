import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, VistaData, SystemStatus } from '../types';
import { AI_SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const textModel = "gemini-2.5-pro";
const ttsModel = "gemini-2.5-flash-preview-tts";

function formatContext(vistaData: VistaData, systemStatus: SystemStatus, chatHistory: ChatMessage[], userQuery: string): string {
    const vistaString = JSON.stringify(vistaData, null, 2);
    const systemString = Object.entries(systemStatus).map(([key, value]) => `${key}: ${value}`).join(', ');

    const historyString = chatHistory.slice(0, -1).map(msg => `${msg.role === 'user' ? 'User' : 'VJA-Core'}: ${msg.content}`).join('\n');

    return `
--- CURRENT INTERACTION CONTEXT ---
[VISTA_DATA]:
${vistaString}

[SYSTEM_STATUS]: ${systemString}
[USER_QUERY]: ${userQuery}

--- PREVIOUS CONVERSATION ---
${historyString.length > 0 ? historyString : "No previous conversation."}

--- YOUR TASK ---
Based on all your rules and the current interaction context, generate the next response for VJA-Core.
`;
}

export const getAiResponse = async (
    userInput: string,
    vistaData: VistaData,
    systemStatus: SystemStatus,
    chatHistory: ChatMessage[]
): Promise<string> => {
    try {
        const fullPrompt = formatContext(vistaData, systemStatus, chatHistory, userInput);
        
        const response = await ai.models.generateContent({
            model: textModel,
            contents: fullPrompt,
            config: {
                systemInstruction: AI_SYSTEM_PROMPT,
                temperature: 0.6,
                topP: 0.9,
                topK: 40,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get response from AI model.");
    }
};

export const getAiSpeech = async (text: string): Promise<string | undefined> => {
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
        return base64Audio;
    } catch(error) {
        console.error("Gemini TTS API call failed:", error);
        return undefined;
    }
};