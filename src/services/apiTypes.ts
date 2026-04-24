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
    },
  ];
}

export type CookDifficulty = "easy" | "medium" | "hard";

export type CookGoal =
  | "high_protein"
  | "balanced"
  | "low_carb"
  | "budget_friendly";

export type CookTimeOption = "15" | "30" | "45+";

export type CookServingOption = "1" | "2" | "4+";

export type CookMaxCaloriesOption = "400" | "600" | "800" | "1000" | "any";

export interface CookCandidateNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface CookCandidate {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  fitReason: string;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: CookDifficulty;
  servings: number;
  nutrition?: CookCandidateNutrition;
}

export interface CookFollowUpQuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface CookFollowUpQuestion {
  id: string;
  title: string;
  type: "single_select" | "text";
  options?: CookFollowUpQuestionOption[];
}

export interface CookFollowUpAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface CookCandidateResponse {
  phase: "clarify" | "candidates" | "error";
  message: string;
  followUpQuestions?: CookFollowUpQuestion[] | null;
  candidates?: CookCandidate[] | null;
}

export interface CookRecipeIngredient {
  id: string;
  item: string;
  amount?: string;
  optional?: boolean;
}

export interface CookRecipeStep {
  id: string;
  title: string;
  instruction: string;
  timerSeconds?: number;
  tips?: string[];
}

export interface CookRecipe {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: CookDifficulty;
  ingredients: CookRecipeIngredient[];
  steps: CookRecipeStep[];
  nutrition?: CookCandidateNutrition;
  variations: string[];
}

export interface CookRecipeResponse {
  recipe: CookRecipe;
}

export interface LatestCookSession {
  recipe: CookRecipe;
  seed: string;
  savedAt: string;
}

export interface CookPromptAnswers {
  seed: string;
  time: CookTimeOption;
  goal: CookGoal;
  servings: CookServingOption;
  maxCaloriesPerServing: CookMaxCaloriesOption;
  followUpAnswers?: CookFollowUpAnswer[];
}

export type CookCandidatesGeneratedParams = {
  goal: string;
  time: string;
  servings: string;
  maxCaloriesPerServing: string;
  followUpCount: number;
  candidateCount: number;
};

export type CookRecipeGeneratedParams = {
  recipeId: string;
  candidateId: string;
  difficulty: string;
  servings: number;
  totalMinutes: number;
  ingredientCount: number;
  stepCount: number;
};

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

const cookCandidateNutritionSchema: Schema = {
  type: SchemaType.OBJECT,
  nullable: true,
  properties: {
    calories: {
      type: SchemaType.NUMBER,
      nullable: true,
    },
    protein: {
      type: SchemaType.NUMBER,
      nullable: true,
    },
    carbs: {
      type: SchemaType.NUMBER,
      nullable: true,
    },
    fats: {
      type: SchemaType.NUMBER,
      nullable: true,
    },
  },
};

const cookRecipeNutritionSchema: Schema = {
  type: SchemaType.OBJECT,
  nullable: false,
  properties: {
    calories: {
      type: SchemaType.NUMBER,
      nullable: false,
    },
    protein: {
      type: SchemaType.NUMBER,
      nullable: false,
    },
    carbs: {
      type: SchemaType.NUMBER,
      nullable: true,
    },
    fats: {
      type: SchemaType.NUMBER,
      nullable: true,
    },
  },
  required: ["calories", "protein"],
};

const cookRecipeVariationsSchema: Schema = {
  type: SchemaType.ARRAY,
  nullable: false,
  items: {
    type: SchemaType.STRING,
  },
};

const cookFollowUpQuestionSchema: Schema = {
  type: SchemaType.OBJECT,
  nullable: true,
  properties: {
    id: {
      type: SchemaType.STRING,
      nullable: false,
    },
    title: {
      type: SchemaType.STRING,
      nullable: false,
    },
    type: {
      type: SchemaType.STRING,
      nullable: false,
      enum: ["single_select", "text"],
      format: "enum",
    },
    options: {
      type: SchemaType.ARRAY,
      nullable: true,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            nullable: false,
          },
          label: {
            type: SchemaType.STRING,
            nullable: false,
          },
          value: {
            type: SchemaType.STRING,
            nullable: false,
          },
        },
        required: ["id", "label", "value"],
      },
    },
  },
  required: ["id", "title", "type"],
};

const cookFollowUpQuestionsSchema: Schema = {
  type: SchemaType.ARRAY,
  nullable: true,
  items: cookFollowUpQuestionSchema,
};

const cookCandidatesSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    phase: {
      type: SchemaType.STRING,
      nullable: false,
      enum: ["clarify", "candidates", "error"],
      format: "enum",
    },
    message: {
      type: SchemaType.STRING,
      nullable: false,
    },
    followUpQuestions: cookFollowUpQuestionsSchema,
    candidates: {
      type: SchemaType.ARRAY,
      nullable: true,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            nullable: false,
          },
          title: {
            type: SchemaType.STRING,
            nullable: false,
          },
          subtitle: {
            type: SchemaType.STRING,
            nullable: false,
          },
          summary: {
            type: SchemaType.STRING,
            nullable: false,
          },
          fitReason: {
            type: SchemaType.STRING,
            nullable: false,
          },
          prepMinutes: {
            type: SchemaType.NUMBER,
            nullable: false,
          },
          cookMinutes: {
            type: SchemaType.NUMBER,
            nullable: false,
          },
          difficulty: {
            type: SchemaType.STRING,
            nullable: false,
            enum: ["easy", "medium", "hard"],
            format: "enum",
          },
          servings: {
            type: SchemaType.NUMBER,
            nullable: false,
          },
          nutrition: cookCandidateNutritionSchema,
        },
        required: [
          "id",
          "title",
          "subtitle",
          "summary",
          "fitReason",
          "prepMinutes",
          "cookMinutes",
          "difficulty",
          "servings",
        ],
      },
    },
  },
  required: ["phase", "message"],
};

const cookRecipeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    recipe: {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.STRING,
          nullable: false,
        },
        title: {
          type: SchemaType.STRING,
          nullable: false,
        },
        subtitle: {
          type: SchemaType.STRING,
          nullable: false,
        },
        summary: {
          type: SchemaType.STRING,
          nullable: false,
        },
        servings: {
          type: SchemaType.NUMBER,
          nullable: false,
        },
        prepMinutes: {
          type: SchemaType.NUMBER,
          nullable: false,
        },
        cookMinutes: {
          type: SchemaType.NUMBER,
          nullable: false,
        },
        difficulty: {
          type: SchemaType.STRING,
          nullable: false,
          enum: ["easy", "medium", "hard"],
          format: "enum",
        },
        ingredients: {
          type: SchemaType.ARRAY,
          nullable: false,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: {
                type: SchemaType.STRING,
                nullable: false,
              },
              item: {
                type: SchemaType.STRING,
                nullable: false,
              },
              amount: {
                type: SchemaType.STRING,
                nullable: true,
              },
              optional: {
                type: SchemaType.BOOLEAN,
                nullable: true,
              },
            },
            required: ["id", "item"],
          },
        },
        steps: {
          type: SchemaType.ARRAY,
          nullable: false,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: {
                type: SchemaType.STRING,
                nullable: false,
              },
              title: {
                type: SchemaType.STRING,
                nullable: false,
              },
              instruction: {
                type: SchemaType.STRING,
                nullable: false,
              },
              timerSeconds: {
                type: SchemaType.NUMBER,
                nullable: true,
              },
              tips: {
                type: SchemaType.ARRAY,
                nullable: true,
                items: {
                  type: SchemaType.STRING,
                },
              },
            },
            required: ["id", "title", "instruction"],
          },
        },
        nutrition: cookRecipeNutritionSchema,
        variations: cookRecipeVariationsSchema,
      },
      required: [
        "id",
        "title",
        "subtitle",
        "summary",
        "servings",
        "prepMinutes",
        "cookMinutes",
        "difficulty",
        "ingredients",
        "steps",
        "nutrition",
        "variations",
      ],
    },
  },
  required: ["recipe"],
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
  cookCandidates: cookCandidatesSchema,
  cookRecipe: cookRecipeSchema,
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
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  description: string;
  title: string;
  preparationTime: string;
  mealType: IMealType;
  instructions: string[];
  ingredients: string[];
  insights: string[];
  image: string | null;
  score: number;
  id?: string;
  date: string;
  mealTypeLocalized: string;
  errorMessage?: string;
  emoji: string;
}
