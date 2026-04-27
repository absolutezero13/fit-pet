import { darkGrayColors } from "../theme/colors";

const getScoreColor = (score: number, colors: typeof darkGrayColors) => {
  if (score >= 8) return colors["color-success-400"];
  if (score >= 6) return colors["color-warning-400"];
  if (score >= 3) return colors["color-danger-300"];
  return colors["color-danger-400"];
};

export default getScoreColor;
