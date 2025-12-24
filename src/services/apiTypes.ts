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
        type: SchemaType.INTEGER,
        description: "Calories",
        nullable: false,
      },
      proteins: {
        type: SchemaType.INTEGER,
        description: "Proteins",
        nullable: false,
      },
      carbs: {
        type: SchemaType.INTEGER,
        description: "Carbs",
        nullable: false,
      },
      fats: {
        type: SchemaType.INTEGER,
        description: "Fats",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "Description",
        nullable: false,
      },
      title: {
        type: SchemaType.STRING,
        description: "Title",
        nullable: false,
      },
      preparationTime: {
        type: SchemaType.STRING,
        description: "Preparation time",
        nullable: false,
      },
      mealType: {
        type: SchemaType.STRING,
        description: "valid values:breakfast, lunch, dinner, snack",
        nullable: false,
        enum: ["breakfast", "lunch", "dinner", "snack"],
        format: "enum",
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
      "title",
      "preparationTime",
      "mealType",
      "instructions",
      "ingredients",
      "insights",
      "mealTypeLocalized",
    ],
  },
};

const macroGoalsSchema: Schema = {
  description: "Macro Goals",
  type: SchemaType.OBJECT,
  properties: {
    proteins: {
      type: SchemaType.INTEGER,
      description: "Proteins as grams",
      nullable: false,
    },
    fats: {
      type: SchemaType.INTEGER,
      description: "Fats as grams",
      nullable: false,
    },
    carbs: {
      type: SchemaType.INTEGER,
      description: "Carbs as grams",
      nullable: false,
    },
  },
  required: ["proteins", "fats", "carbs"],
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
      enum: ["breakfast", "lunch", "dinner", "snack"],
      format: "enum",
    },
    mealTypeLocalized: {
      type: SchemaType.STRING,
      description: "Localized meal type",
      nullable: false,
    },
    emoji: {
      type: SchemaType.STRING,
      description: "Emoji of the meal",
      nullable: false,
    },
    errorMessage: {
      type: SchemaType.STRING,
      description: "Error message",
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
    "mealTypeLocalized",
    "emoji",
  ],
};

export const schemas: Record<string, Schema> = {
  recipe: recipeSchema,
  analyzedMeal: analyzedMealSchema,
  macroGoals: macroGoalsSchema,
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

export type IMealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface IMeal {
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
  description: string;
  title: string;
  preparationTime: string;
  mealType: IMealType;
  instructions: string[];
  ingredients: string[];
  insights: string[];
  image: string | null;
  score: number;
  _id?: string;
  date: string;
  mealTypeLocalized: string;
  errorMessage?: string;
  emoji: string;
}
