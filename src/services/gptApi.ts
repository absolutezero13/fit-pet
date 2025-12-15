import { Part } from "@google/generative-ai";
import promptBuilder from "../utils/promptBuilder";
import useOnboardingStore from "../zustand/useOnboardingStore";
import { ChatCompletion, GeminiResponse, IMeal, schemas } from "./apiTypes";
import api, { ENDPOINT } from "./api";
import useUserStore from "../zustand/useUserStore";

export const createChatCompletion = async (
  content: string
): Promise<ChatCompletion> => {
  try {
    const body = JSON.stringify({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        },
      ],
    });

    const res = await api.post("/chat", body);

    return res.data;
  } catch (error) {
    return error as any;
  }
};

export const createGeminiCompletion = async (
  content: string,
  schema: string,
  images?: { data: string; mimeType: string }[]
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await api.post("/chat/gemini", {
      prompt: content,
      schema: schemas[schema],
      images,
      systemPrompt: promptBuilder.createChatPrompt(useUserStore.getState()),
    });

    return res.data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};

export const createGeminiVisionCompletion = async (
  image: { uri: string; mimeType: string },
  content?: string,
  schema?: string
): Promise<{ response: GeminiResponse }> => {
  try {
    const formData = new FormData();

    if (content) {
      formData.append("prompt", content);
    }

    //@ts-ignore
    formData.append("image", {
      uri: image.uri,
      type: image.mimeType,
      name: "photo.jpg",
    });

    if (schema) {
      formData.append("schema", JSON.stringify(schemas[schema]));
    }

    const res = await api.post("/vision", formData, {});

    return res.data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};

export interface Content {
  role: string;
  parts: Part[];
}

export const createGeminiStream = async (
  content: string,
  history: Content[]
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await api.post("/chat/gemini-stream", {
      systemPrompt: promptBuilder.createChatPrompt(useUserStore.getState()),
      history,
      prompt: content,
    });

    return res.data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};

// WILL BE IMPLEMENTED
export const swapRecipe = async (
  recipe: IMeal,
  content: string,
  schema: string
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await api.post("/chat/gemini", {
      recipe,
      prompt: content,
      schema: schemas[schema],
      systemPrompt: promptBuilder.createChatPrompt(useUserStore.getState()),
    });

    return res.data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};

export const createGeminiImage = async (
  content: string
): Promise<{ data: string }> => {
  try {
    const res = await api.post("/chat/gemini-image", {
      prompt: content,
    });

    return res.data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};
