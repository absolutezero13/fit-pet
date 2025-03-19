import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

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
  content: string,
  schema: string
): Promise<{ response: GeminiResponse }> => {
  try {
    console.log("GEMINI", content);
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

const recipeSchema: Schema = {
  description: "List of recipes",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      calories: {
        type: SchemaType.STRING,
        description: "Calories",
        nullable: false,
      },
      proteins: {
        type: SchemaType.STRING,
        description: "Proteins",
        nullable: false,
      },
      carbs: {
        type: SchemaType.STRING,
        description: "Carbs",
        nullable: false,
      },
      fats: {
        type: SchemaType.STRING,
        description: "Fats",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "Description",
        nullable: false,
      },
      time: {
        type: SchemaType.STRING,
        description: "Time",
        nullable: false,
      },

      mealType: {
        type: SchemaType.STRING,
        description: "Meal type",
        nullable: false,
      },
      instructions: {
        type: SchemaType.ARRAY,
        description: "Instructions",
        nullable: false,
        items: {
          type: SchemaType.STRING,
        },
      },
      ingredients: {
        type: SchemaType.ARRAY,
        description: "Ingredients",
        nullable: false,
        items: {
          type: SchemaType.STRING,
        },
      },
      insights: {
        type: SchemaType.ARRAY,
        description: "Insights",
        nullable: false,
        items: {
          type: SchemaType.STRING,
        },
      },
    },
    required: [
      "calories",
      "proteins",
      "carbs",
      "fats",
      "description",
      "time",
      "mealType",
      "instructions",
      "ingredients",
      "insights",
    ],
  },
};

const analyzedMealSchema: Schema = {
  description: "Analyzed meal",
  type: SchemaType.OBJECT,
  properties: {
    calories: {
      type: SchemaType.NUMBER,
      description: "Calories",
      nullable: false,
    },
    proteins: {
      type: SchemaType.NUMBER,
      description: "Proteins",
      nullable: false,
    },
    carbs: {
      type: SchemaType.NUMBER,
      description: "Carbs",
      nullable: false,
    },
    fats: {
      type: SchemaType.NUMBER,
      description: "Fats",
      nullable: false,
    },

    description: {
      type: SchemaType.STRING,
      description: "Description",
      nullable: false,
    },
    score: {
      type: SchemaType.NUMBER,
      description: "Score",
      nullable: false,
    },
    insights: {
      type: SchemaType.ARRAY,
      description: "Insights",
      nullable: false,
      items: {
        type: SchemaType.STRING,
      },
    },
    mealType: {
      type: SchemaType.STRING,
      description: "string as in Breakfast, Lunch, Dinner, Snack",
      nullable: true,
    },
  },
  required: [
    "calories",
    "proteins",
    "carbs",
    "fats",
    "description",
    "score",
    "insights",
    "mealType",
  ],
};

const schemas: Record<string, Schema> = {
  recipe: recipeSchema,
  analyzedMeal: analyzedMealSchema,
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
