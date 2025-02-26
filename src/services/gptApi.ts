export const ENDPOINT =
  "https://us-central1-gpt-assistant-19b00.cloudfunctions.net/app/";

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

export const createChatCompletion = async (
  content: string,
  user: {
    settings: {
      craziness?: number;
      model: string;
    };
  }
): Promise<ChatCompletion> => {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        content,
        user: {
          email: null,
          displayName: "Anonymous Stranger",
          photoURL: null,
          uid: "FcvSCs6pjaOEuTS74VVJV5DhY852",
          messageHistory: [],
          role: "user",
          type: "anonymous",
          settings: {
            model: user.settings.model,
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.json();
  } catch (error) {
    console.log("error", error);
    return error as any;
  }
};

export interface IMeal {
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
  description: string;
  time: string;
  mealType: string;
}
