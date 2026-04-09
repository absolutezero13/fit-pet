import { Part } from "@google/generative-ai";
import promptBuilder from "../utils/promptBuilder";
import useOnboardingStore from "../zustand/useOnboardingStore";
import {
  ChatCompletion,
  CookCandidate,
  CookCandidateResponse,
  CookPromptAnswers,
  CookRecipeResponse,
  CookRecipe,
  GeminiResponse,
  IMeal,
  schemas,
} from "./apiTypes";
import api, { ENDPOINT } from "./api";
import useUserStore from "../zustand/useUserStore";

const extractGeminiText = (result: { response: GeminiResponse }) => {
  const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no text content");
  }

  return text;
};

const parseGeminiJson = <T>(result: { response: GeminiResponse }): T => {
  const text = extractGeminiText(result);

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.log("GEMINI JSON PARSE ERROR", text);
    throw error;
  }
};

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
  images?: { data: string; mimeType: string }[],
  systemPromptOverride?: string
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await api.post("/chat/gemini", {
      prompt: content,
      schema: schemas[schema],
      images,
      systemPrompt:
        systemPromptOverride ?? promptBuilder.createChatPrompt(useUserStore.getState()),
    });

    return res.data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    throw error;
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

export const createCookCandidates = async (
  answers: CookPromptAnswers
): Promise<CookCandidateResponse> => {
  const user = useUserStore.getState();
  const prompt = promptBuilder.createCookCandidatesPrompt(user, answers);
  const result = await createGeminiCompletion(prompt, "cookCandidates");

  return parseGeminiJson<CookCandidateResponse>(result);
};

export const createCookRecipe = async (
  answers: CookPromptAnswers,
  candidate: CookCandidate
): Promise<CookRecipeResponse> => {
  const user = useUserStore.getState();
  const prompt = promptBuilder.createCookRecipePrompt(user, answers, candidate);
  const result = await createGeminiCompletion(prompt, "cookRecipe");

  return parseGeminiJson<CookRecipeResponse>(result);
};

export const createCookLoggedMeal = async (
  recipe: CookRecipe
): Promise<IMeal> => {
  const user = useUserStore.getState();
  const prompt = promptBuilder.createCookMealLogPrompt(user, recipe);
  const result = await createGeminiCompletion(prompt, "analyzedMeal");

  return parseGeminiJson<IMeal>(result);
};
