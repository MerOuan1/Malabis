
import { GoogleGenAI } from "@google/genai";
import { ImagePart, EditedImageResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const editImage = async (images: ImagePart[], prompt: string): Promise<EditedImageResult> => {
  const imageParts = images.map((image) => ({
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  }));

  const contentParts = [...imageParts, { text: prompt }];
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: contentParts },
      config: {
        systemInstruction: 'You are an expert image editor AI. Your task is to modify the provided image(s) based on the user\'s text instruction. The output must contain the edited image. It may also contain a short text response.',
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      const refusalText = response.text?.trim();
      if (refusalText) throw new Error(refusalText);
      throw new Error("The AI returned an empty response.");
    }

    let newImage: ImagePart | null = null;
    let responseText: string | undefined;

    for (const part of parts) {
      if (part.inlineData) {
        newImage = {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      } else if (part.text) {
        responseText = part.text;
      }
    }

    if (!newImage) {
      if (responseText) throw new Error(responseText);
      throw new Error("The AI did not return an edited image.");
    }

    return { newImage, responseText };
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error("لم نتمكن من تعديل الصورة. الرجاء المحاولة مرة أخرى.");
  }
};
