import { Part } from "@google/generative-ai";
import { createChatPrompt } from "../utils/mealPrompt";
import useOnboardingStore from "../zustand/useOnboardingStore";
import { ChatCompletion, GeminiResponse, schemas } from "./apiTypes";

export const ENDPOINT = "http://localhost:3000/api";

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
  schema: string
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await fetch(ENDPOINT + "/chat/gemini", {
      method: "POST",
      body: JSON.stringify({
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
