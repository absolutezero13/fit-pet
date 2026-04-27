import type { ThemeColors } from "../theme/colors";

const getScoreColor = (score: number, colors: ThemeColors) => {
  if (score >= 8) return colors["color-success-500"];
  if (score >= 6) return colors["color-success-400"];
  if (score >= 4) return colors["color-warning-500"];
  if (score >= 2) return colors["color-warning-600"];
  return colors["color-danger-500"];
};

export default getScoreColor;
