export const ENDPOINT = "http://localhost:3000/api";

export interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: [
    {
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
      index: number;
    }
  ];
}

export const createChatCompletion = async (
  content: string
): Promise<ChatCompletion> => {
  try {
    const res = await fetch(ENDPOINT + "/chat", {
      method: "POST",
      body: JSON.stringify({
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
      }),
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
  content: string
): Promise<{ response: GeminiResponse }> => {
  try {
    const res = await fetch(ENDPOINT + "/chat/gemini", {
      method: "POST",
      body: JSON.stringify({
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

interface GeminiResponse {
  candidates: Candidate[];
  usage_metadata: UsageMetadata;
}

interface Candidate {
  content: Content;
  index: number;
  safety_ratings: SafetyRating[];
  finish_reason: string;
}

interface Content {
  parts: ContentPart[];
  role: "model" | "user";
}

interface ContentPart {
  text: string;
}

interface SafetyRating {
  category: string;
  probability: "NEGLIGIBLE" | "LOW" | "MEDIUM" | "HIGH";
}

interface UsageMetadata {
  prompt_token_count: number;
  candidates_token_count: number;
  total_token_count: number;
}

export interface IMeal {
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
  description: string;
  time: string;
  mealType: string;
  instructions: string[];
  ingredients: string[];
  insights: string[];
  image: string;
}

export const exampleMeal: IMeal = {
  calories: "500", //string
  proteins: "20", //string
  carbs: "50", //string
  fats: "10", //string,
  description: "Chicken and rice", //string
  time: "18:00 - 20:00", //string
  mealType: "Dinner", //string
  instructions: ["Cook the chicken", "Cook the rice"], //string[]
  ingredients: ["300g of Chicken", "200g of Rice"], //string[]
  insights: ["High in protein", "High in carbs"], //string[]
  image: "/api/placeholder/400/250",
};
