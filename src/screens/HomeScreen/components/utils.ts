export const getGramGoal = ({ calorieGoal, kcalCoefficent, percentage }) => {
  return (calorieGoal / kcalCoefficent) * (percentage / 100);
};
