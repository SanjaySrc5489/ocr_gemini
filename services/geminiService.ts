import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { TableData } from "../types";

// Initialize Gemini Client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTableData = async (
  base64Image: string, 
  mimeType: string,
  onProgress: (message: string) => void
): Promise<TableData> => {
  try {
    const modelId = 'gemini-3-pro-preview'; // Updated to Gemini 3 Pro Preview for maximum accuracy

    onProgress("Initializing AI model...");

    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Extract the handwritten tabular data from this image into a structured 2D array JSON format.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "A 2D array representing the table. The first array contains headers, subsequent arrays contain row data.",
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "The content of a single cell as a string."
            }
          }
        },
        temperature: 0.1, // Low temperature for higher determinism/accuracy
      },
    });

    let fullText = '';
    let chunkCount = 0;

    for await (const chunk of responseStream) {
      chunkCount++;
      const text = chunk.text;
      if (text) {
        fullText += text;
        // Provide visual feedback that data is streaming in
        if (chunkCount % 3 === 0) {
          onProgress(`Receiving data stream (chunk ${chunkCount})...`);
        }
      }
    }

    onProgress("Finalizing structure...");

    if (fullText) {
      // Clean up any potential Markdown formatting that might have slipped through
      const cleanedText = fullText.replace(/```json\n?|```/g, '').trim();
      const parsedData = JSON.parse(cleanedText) as TableData;
      return parsedData;
    } else {
      throw new Error("No data returned from the model.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};