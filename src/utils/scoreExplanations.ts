import { AITone } from "../zustand/usePreferencesStore";

/**
 * Returns the translation key for a score explanation based on the AI tone.
 * @param score - The meal score (1-10)
 * @param aiTone - The AI tone setting
 * @returns The translation key for the score explanation
 */
export const getScoreTranslationKey = (score: number, aiTone: AITone): string => {
  const roundedScore = Math.max(1, Math.min(10, Math.floor(score)));

  // For harsh tone (default), use the original score keys
  if (aiTone === AITone.Harsh) {
    return `score${roundedScore}`;
  }

  // For other tones, use tone-suffixed keys
  return `score${roundedScore}_${aiTone}`;
};
