import { Part } from "@google/generative-ai";
import { getAuth } from "@react-native-firebase/auth";
import promptBuilder from "../utils/promptBuilder";
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
  content: string,
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
  systemPromptOverride?: string,
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await api.post("/chat/gemini", {
      prompt: content,
      schema: schemas[schema],
      images,
      systemPrompt:
        systemPromptOverride ??
        promptBuilder.createChatPrompt(useUserStore.getState()),
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
  schema?: string,
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

    const token = await getAuth().currentUser?.getIdToken();
    const response = await fetch(`${ENDPOINT}/vision`, {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      body: formData,
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error(
          "Captured photo is too large to upload. Please retake it.",
        );
      }

      throw new Error(
        typeof data?.error === "string"
          ? data.error
          : `Vision request failed (${response.status})`,
      );
    }

    return data;
  } catch (error) {
    console.log("GEMINI ERROR", error);
    throw error;
  }
};

export interface Content {
  role: string;
  parts: Part[];
}

export const createGeminiStream = async (
  content: string,
  history: Content[],
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
  schema: string,
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

export const createCookCandidates = async (
  answers: CookPromptAnswers,
): Promise<CookCandidateResponse> => {
  const user = useUserStore.getState();
  const prompt = promptBuilder.createCookCandidatesPrompt(user, answers);
  const result = await createGeminiCompletion(prompt, "cookCandidates");

  return parseGeminiJson<CookCandidateResponse>(result);
};

export const createCookRecipe = async (
  answers: CookPromptAnswers,
  candidate: CookCandidate,
  options?: {
    variation?: string;
    currentRecipe?: CookRecipe;
  },
): Promise<CookRecipeResponse> => {
  const user = useUserStore.getState();
  const prompt = promptBuilder.createCookRecipePrompt(
    user,
    answers,
    candidate,
    options,
  );
  const result = await createGeminiCompletion(prompt, "cookRecipe");

  return parseGeminiJson<CookRecipeResponse>(result);
};

export const createCookLoggedMeal = async (
  recipe: CookRecipe,
): Promise<IMeal> => {
  const user = useUserStore.getState();
  const mealDescription = buildCookedMealDescription(recipe);
  const prompt = promptBuilder.createAnalysisPrompt(
    user ?? {},
    mealDescription,
    "",
  );
  const result = await createGeminiCompletion(prompt, "analyzedMeal");

  return parseGeminiJson<IMeal>(result);
};

const buildCookedMealDescription = (recipe: CookRecipe): string => {
  const lines: string[] = [];
  lines.push(`${recipe.title}${recipe.summary ? `. ${recipe.summary}` : ""}`);

  const n = recipe.nutrition;
  if (n) {
    const parts: string[] = [];
    if (n.calories != null) parts.push(`${n.calories} kcal`);
    if (n.protein != null) parts.push(`protein ${n.protein}g`);
    if (n.carbs != null) parts.push(`carbs ${n.carbs}g`);
    if (n.fats != null) parts.push(`fats ${n.fats}g`);
    if (parts.length) lines.push(`Per serving: ${parts.join(", ")}.`);
  }

  if (recipe.ingredients?.length) {
    const ing = recipe.ingredients
      .map((i) => (i.amount ? `${i.amount} ${i.item}` : i.item))
      .join(", ");
    lines.push(`Ingredients: ${ing}.`);
  }

  lines.push(
    "The user just cooked this recipe and is logging exactly one serving. Use the per-serving nutrition above as the strongest source for calories and macros.",
  );

  return lines.join("\n");
};
