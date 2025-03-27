import { Part } from "@google/generative-ai";
import { createChatPrompt } from "../utils/mealPrompt";
import useOnboardingStore from "../zustand/useOnboardingStore";
import { ChatCompletion, GeminiResponse, IMeal, schemas } from "./apiTypes";

export const ENDPOINT = "http://127.0.0.1:3000/api";

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

    const res = await fetch(ENDPOINT + "/chat", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
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
    const res = await fetch(ENDPOINT + "/chat/gemini", {
      method: "POST",
      body: JSON.stringify({
        prompt: content,
        schema: schemas[schema],
        images,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
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

    formData.append("image", {
      uri: image.uri,
      type: image.mimeType,
      name: "photo.jpg",
    });

    if (schema) {
      formData.append("schema", JSON.stringify(schemas[schema]));
    }
    const res = await fetch(ENDPOINT + "/vision", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.json();
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
    const res = await fetch(ENDPOINT + "/chat/gemini-stream", {
      method: "POST",
      body: JSON.stringify({
        systemPrompt: createChatPrompt(useOnboardingStore.getState()),
        history,
        prompt: content,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};

export const swapRecipe = async (
  recipe: IMeal,
  content: string,
  schema: string
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await fetch(ENDPOINT + "/chat/gemini", {
      method: "POST",
      body: JSON.stringify({
        recipe,
        prompt: content,
        schema: schemas[schema],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  } catch (error) {
    console.log("GEMINI ERROR", error);
    return error as any;
  }
};
