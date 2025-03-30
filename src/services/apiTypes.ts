import { Schema, SchemaType } from "@google/generative-ai";

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

const recipeSchema: Schema = {
  description: "List of recipes",
  type: SchemaType.ARRAY,
  items: {
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
      mealTypeLocalized: {
        type: SchemaType.STRING,
        description: "Localized meal type",
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
      "mealTypeLocalized",
    ],
  },
};

const analyzedMealSchema: Schema = {
  description: "Analyzed meal",
  type: SchemaType.OBJECT,
  properties: {
    id: {
      type: SchemaType.STRING,
      description: "unique id",
      nullable: false,
    },
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
    date: {
      type: SchemaType.STRING,
      description: "ISO Date",
      nullable: false,
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
    "id",
    "date",
  ],
};

export const schemas: Record<string, Schema> = {
  recipe: recipeSchema,
  analyzedMeal: analyzedMealSchema,
};

export interface GeminiResponse {
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
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  instructions: string[];
  ingredients: string[];
  insights: string[];
  image: string;
  score: number;
  id: string;
  date: string;
  mealTypeLocalized: string;
}

export const exampleMeal: IMeal = {
  calories: "500", //string
  proteins: "20", //string
  carbs: "50", //string
  fats: "10", //string,
  description: "Chicken and rice", //string
  time: "18:00 - 20:00", //string
  mealType: "dinner", //string
  mealTypeLocalized: "Dinner", //string
  instructions: ["Cook the chicken", "Cook the rice"], //string[]
  ingredients: ["300g of Chicken", "200g of Rice"], //string[]
  insights: ["High in protein", "High in carbs"], //string[]
  image: "/api/placeholder/400/250",
  score: 6.5,
  id: "placeholder",
  date: new Date().toISOString(),
};
