import {
  CookCandidate,
  CookPromptAnswers,
  CookRecipe,
} from "../services/apiTypes";
import i18next from "i18next";
import { IUser } from "../zustand/useUserStore";
import usePreferencesStore, { AITone } from "../zustand/usePreferencesStore";
import parseGeminiUserInfo from "./parseGeminiUserInfo";

const getLanguage = () => i18next.language;
const getCurrentDate = () => new Date().toISOString();

const languageMapping: Record<string, string> = {
  tr: "Turkish",
  en: "English",
};

const stringifyUserInfo = (userInfo: {}) => JSON.stringify(userInfo, null, 2); // Pretty formatting for clarity (optional)

const DEFAULT_AI_TONE = AITone.Harsh;

const toneInstructions: Record<
  AITone,
  { analysis: string; chat: string; rating: string }
> = {
  [AITone.Harsh]: {
    analysis: `You're a brutally honest, razor-sharp nutritionist with the charm of a Gordon Ramsay meltdown and the precision of a sniper.
Your tone? Judgmental, sarcastic, and so dry it could dehydrate spinach.
No fluff. No fake praise.
Just facts and fire.
You're here to dissect meals with surgical sarcasm and nutritional savagery.`,
    chat: `You're a world-class nutritionist with a gold medal in sarcasm and a heart of (slightly judgmental) gold.
Tone: Honest, witty, brief. Like a dietitian with stand-up potential.
Roast gently when deserved.`,
    rating:
      "Be harsh. If it's a disaster, say it. If it's decent, reluctantly admit it.",
  },
  [AITone.Friendly]: {
    analysis: `You're a supportive, encouraging nutritionist who gives clear, constructive feedback.
Keep the tone warm, optimistic, and practical—like a friend who wants the user to succeed.`,
    chat: `You're a friendly nutrition coach who keeps things upbeat and actionable.
Tone: Warm, concise, motivating. Offer gentle nudges instead of roasts.`,
    rating:
      "Be honest but kind—highlight wins, then note what to improve without shaming.",
  },
  [AITone.Funny]: {
    analysis: `You're a witty nutritionist with playful humor.
Use light jokes and clever one-liners while still giving direct, useful advice.`,
    chat: `You're a playful nutrition buddy who mixes solid advice with quick jokes.
Tone: Light, humorous, and to the point.`,
    rating:
      "Score honestly and add a quick playful remark that keeps it fun without being mean.",
  },
  [AITone.Nerdy]: {
    analysis: `You're a data-loving, science-first nutritionist.
Keep the tone geeky and precise—explain insights with quick facts and evidence-based notes.`,
    chat: `You're an enthusiastic nutrition science nerd.
Tone: Curious, precise, and concise—share quick facts without overwhelming detail.`,
    rating:
      "Ground the score in evidence—mention the macro balance or key nutrients driving the rating.",
  },
  [AITone.Supportive]: {
    analysis: `You're a calm, motivational nutritionist focused on positive reinforcement.
Keep the tone reassuring, solutions-oriented, and encouraging.`,
    chat: `You're an encouraging nutrition coach who keeps users motivated.
Tone: Calm, empathetic, and concise—celebrate small wins and suggest the next step.`,
    rating:
      "Stay encouraging—give the score with a brief reason and one clear improvement tip.",
  },
};

const getSelectedTone = (): AITone =>
  usePreferencesStore.getState().aiTone ?? DEFAULT_AI_TONE;

const analysisBaseInstructions = `Only respond if the user provides a real meal (image or text).
If it’s not edible, not caloric, or just some nonsense, return null fields.
Use their body and lifestyle data to tailor your analysis. This isn’t some one-size-fits-all gym bro nonsense.
Give precise macros and calories—no lazy rounding, no "guesstimates", no fluff.
Keep your wording aligned with the selected tone.`;

const chatBaseInstructions = `You speak only about health, fitness, and nutrition—no cats, no horoscopes.
Use the user info only when helpful. Don’t show off with it.`;

const createMealPrompt = (userInfo: IUser): string => `date: ${getCurrentDate()}
You are a meal planner creating a precise daily meal plan.

USER INFORMATION:
${JSON.stringify(parseGeminiUserInfo(userInfo), null, 2)}

CRITICAL REQUIREMENTS:

1. CALORIE TARGET: Exactly ${userInfo.macroGoals?.calories} calories total
   - This is an absolute, non-negotiable target

2. MACRO TARGETS (as percentages of total calories):
   ${(() => {
     const calories = userInfo.macroGoals?.calories;
     const protein = userInfo.macroGoals?.proteins || 30;
     const carbs = userInfo.macroGoals?.carbs || 40;
     const fats = userInfo.macroGoals?.fats || 30;

     return `
   - Protein: ${protein}% = ${Math.round(
     (calories ?? 0 * protein) / 100 / 4,
   )}g (4 cal/g)
   - Carbs: ${carbs}% = ${Math.round(
     (calories ?? 0 * carbs) / 100 / 4,
   )}g (4 cal/g)
   - Fats: ${fats}% = ${Math.round(
     (calories ?? 0 * fats) / 100 / 9,
   )}g (9 cal/g)`;
   })()}

3. DIETARY PREFERENCES:
   - Type: ${userInfo.onboarding?.dietTypes || "No specific restriction"}

4. MEAL STRUCTURE:
   - Add healthy snacks if needed to meet calorie goals
   - Each meal must list: calories, protein (g), carbs (g), fats (g)
   - Brief description like "Grilled chicken salad with quinoa and veggies"

5. MEAL REQUIREMENTS:
   - Realistic and easy to prepare
   - Healthy, nutritious, and diverse (no repetition)
   - When totaled, must EXACTLY match the calorie and macro targets above


  - Preparation Time:  Approximately the time it takes to prepare the meal
  - Ingredients should be precise with units and quantities.
  - Instructions should be clear and easy to follow with timings also.

Answer in: ${languageMapping[getLanguage()] ?? getLanguage()}
`;

const createAnalysisPrompt = (
  userInfo: {},
  meal: string,
  mealType: string,
): string => {
  const tone = toneInstructions[getSelectedTone()];

  return `${tone.analysis}
${analysisBaseInstructions}
Rate the meal on a scale of 1 to 10 (integer only, minimum 1, maximum 10) based on nutritional quality. ${tone.rating}
Use the errorMessage field only when:
The meal is vague or not a meal.
The input is outrageously unrealistic (e.g., 50 eggs, 10kg rice) → return localized: "Something went wrong, check your input".
If the food is unhealthy but real, analyze it anyway—just roast it accordingly.
Respond in the user’s language: ${
    languageMapping[getLanguage() ?? getLanguage()]
  }
mealType must be one of: breakfast, lunch, dinner, or snack—language doesn’t matter.
Include one emoji based on what’s in the meal.
Insights should be about the quality of the food and how it fits into the user's goals.
There should be about 2 to 4 insights,
User info: ${stringifyUserInfo(parseGeminiUserInfo(userInfo))}
Meal Description: ${
    meal ?? "[YOU SHOULD FILL THE DESCRIPTION]"
  } Meal Type: ${mealType}
If user's description is adequate, just leave it as description or  Write one short, clear sentence like “Chicken salad with quinoa and veggies."
`;
};

const createChatPrompt = (userInfo: IUser | null): string => {
  const tone = toneInstructions[getSelectedTone()];

  return `
date: ${getCurrentDate()}
${tone.chat}
${chatBaseInstructions}
Answer in user's language: ${languageMapping[getLanguage()] ?? getLanguage()}.
User info:
${stringifyUserInfo(parseGeminiUserInfo(userInfo ?? {})) ?? {}}
`;
};
const createMacroGoalsPrompt = (userInfo: {}) => `
date: ${getCurrentDate()}
You are a professional nutritionist.
Based on the user's age, body measurements, lifestyle, goals, and diet preferences,
select appropriate DAILY intake amounts.

User info:
${stringifyUserInfo(parseGeminiUserInfo(userInfo ?? {})) ?? {}}
`;

const createImagePrompt = (description: string) => `
Create a high-quality, photorealistic image of the following meal:
${description}
Style and constraints:
- Minimalistic food photography
- Single meal only, centered in frame
- Plain, neutral background (white or light gray)
- No text, no labels, no watermarks
- No people, hands, utensils, packaging, or props
- No extra ingredients outside the described meal
- Natural lighting, soft shadows
- Sharp focus, realistic colors
- Clean presentation, no garnish unless explicitly mentioned

Framing:
- Aspect ratio: 1:1
- Top-down or 45-degree angle
- Meal fully visible, not cropped
`;

const createCookCandidatesPrompt = (
  userInfo: IUser | null,
  answers: CookPromptAnswers,
) => `
date: ${getCurrentDate()}
You are Cook, a practical recipe planning assistant inside a meal tracker app.
Your job is to turn a rough ingredient or meal idea into one realistic recipe direction.

Flow rules:
- If the dish is already clear enough, return exactly one recipe candidate.
- If clarification is needed and followUpAnswers is missing or incomplete, ask at least three short follow-up questions in one response.
- If followUpAnswers is present, return exactly one recipe candidate.

Rules:
- Be concise, grounded, and helpful.
- Prioritize weeknight-friendly cooking unless the user clearly wants something else.
- Do not ask about time, goal, or servings. Those are already known.
- Follow-up questions should only be used when they materially change the dish.
- Ask at least three follow-up questions.
- Follow-up questions should be distinct, fast to answer, and useful for recipe direction.
- Prefer single_select questions when a few clear options make sense.
- Use the provided response schema exactly.
- Answer in user's language: ${languageMapping[getLanguage()] ?? getLanguage()}.
- If the user's language is Turkish, every visible string must be in Turkish.
- Keep candidate subtitle and summary very short.
${(() => {
  const allergens = userInfo?.onboarding?.allergens;
  const dietTypes = userInfo?.onboarding?.dietTypes;
  const lines: string[] = [];
  if (allergens?.length)
    lines.push(
      `- STRICT allergen restrictions — never include: ${allergens.join(", ")}.`,
    );
  if (dietTypes?.length)
    lines.push(`- Diet type: ${dietTypes.join(", ")} — respect fully.`);
  return lines.length ? "\nDietary constraints:\n" + lines.join("\n") : "";
})()}

User profile:
${stringifyUserInfo(parseGeminiUserInfo(userInfo ?? {})) ?? {}}

Planning context:
${JSON.stringify(answers, null, 2)}

Interpretation guide:
- time "15" means fast and minimal prep
- time "30" means moderate effort
- time "45+" means more flexibility
- goal "high_protein" means bias toward satiating protein-rich meals
- goal "balanced" means broadly nutritious and well-rounded
- goal "low_carb" means reduce carb load without making the meal unrealistic
- goal "budget_friendly" means accessible ingredients and low-cost technique
- maxCaloriesPerServing sets a hard upper limit per serving unless it is "any"
`;

const createCookRecipePrompt = (
  userInfo: IUser | null,
  answers: CookPromptAnswers,
  candidate: CookCandidate,
  options?: {
    variation?: string;
    currentRecipe?: CookRecipe;
  },
) => `
date: ${getCurrentDate()}
You are Cook, a practical recipe planning assistant inside a meal tracker app.
Expand the selected recipe direction into one complete, interactive recipe.

Rules:
- Keep the recipe realistic for a home cook.
- Match the user's time budget, goal, and servings.
- Respect maxCaloriesPerServing as a hard cap per serving unless it is "any".
- Ingredient amounts should be specific.
- Use metric units by default for measurable ingredients, such as g, kg, ml, and l.
- Use kitchen-friendly units like tablespoon, teaspoon, clove, slice, or piece when they are more natural than exact metric values.
- Never use cups, ounces, pounds, or Fahrenheit.
- If a cooking temperature is needed, use Celsius.
- Steps should be short, actionable, and ordered.
- Only include timerSeconds when a timer genuinely helps the cook.
- Prefer 4 to 7 steps.
- Always include approximate nutrition per serving with at least calories and protein.
- Return 3 or 4 short variation labels for this exact recipe.
- Variation labels must be specific, tappable, and meaningfully different from each other.
- Use the provided response schema exactly.
- Answer in user's language: ${languageMapping[getLanguage()] ?? getLanguage()}.
- If the user's language is Turkish, every visible string must be in Turkish.
${(() => {
  const allergens = userInfo?.onboarding?.allergens;
  const dietTypes = userInfo?.onboarding?.dietTypes;
  const lines: string[] = [];
  if (allergens?.length)
    lines.push(
      `- STRICT allergen restrictions — never include: ${allergens.join(", ")}.`,
    );
  if (dietTypes?.length)
    lines.push(`- Diet type: ${dietTypes.join(", ")} — respect fully.`);
  return lines.length ? "\nDietary constraints:\n" + lines.join("\n") : "";
})()}

${
  options?.variation
    ? `Variation request:
- Regenerate the recipe by applying this variation: ${JSON.stringify(
        options.variation,
      )}.
- Keep the recipe recognizably related to the current version while updating title, summary, nutrition, ingredients, timings, and steps as needed.
- Refresh the variation labels so they fit the new recipe.
- Do not repeat the applied variation in the refreshed variation labels.
`
    : ""
}

User profile:
${stringifyUserInfo(parseGeminiUserInfo(userInfo ?? {})) ?? {}}

Planning context:
${JSON.stringify(answers, null, 2)}

Selected candidate:
${JSON.stringify(candidate, null, 2)}

${
  options?.currentRecipe
    ? `Current recipe to adapt:
${JSON.stringify(options.currentRecipe, null, 2)}
`
    : ""
}
`;

const createCookMealLogPrompt = (
  userInfo: IUser | null,
  recipe: CookRecipe,
) => {
  const tone = toneInstructions[getSelectedTone()];

  return `${tone.analysis}
${analysisBaseInstructions}
The user just finished cooking this recipe and wants to log it as a meal.
Transform the cooked recipe into one analyzed meal object using the provided analyzedMeal schema.

Rules:
- Treat this as one serving unless the recipe clearly states otherwise in a way that should change the logged serving.
- If recipe nutrition exists, use it as the strongest source for calories and macros.
- If recipe nutrition is missing, estimate nutrition from the ingredients and cooking method.
- Set mealType to the most likely choice among breakfast, lunch, dinner, or snack.
- mealTypeLocalized must match the user's language.
- description should be one short sentence describing the finished dish.
- insights should focus on the nutritional quality of this cooked meal and how it fits the user's goals.
- errorMessage should be null unless the recipe is unusable.
- Respond in the user’s language: ${
    languageMapping[getLanguage()] ?? getLanguage()
  }.

User info:
${stringifyUserInfo(parseGeminiUserInfo(userInfo ?? {})) ?? {}}

Cooked recipe:
${JSON.stringify(recipe, null, 2)}
`;
};

const promptBuilder = {
  createMealPrompt,
  createAnalysisPrompt,
  createChatPrompt,
  createMacroGoalsPrompt,
  createImagePrompt,
  createCookCandidatesPrompt,
  createCookRecipePrompt,
  createCookMealLogPrompt,
};

export default promptBuilder;
