type Params = {
  calorieGoal: number;
  kcalCoefficent: number;
  percentage: number;
};

export const getGramGoal = ({
  calorieGoal,
  kcalCoefficent,
  percentage,
}: Params) => {
  return (calorieGoal / kcalCoefficent) * (percentage / 100);
};
