import {
  CookGoal,
  CookMaxCaloriesOption,
  CookServingOption,
  CookTimeOption,
} from "../../services/apiTypes";

export const getTimeLabel = (t: (key: string) => string, value: string) => {
  switch (value as CookTimeOption) {
    case "15":
      return t("cookTime15");
    case "30":
      return t("cookTime30");
    default:
      return t("cookTime45");
  }
};

export const getGoalLabel = (t: (key: string) => string, value: string) => {
  switch (value as CookGoal) {
    case "high_protein":
      return t("cookGoalHighProtein");
    case "low_carb":
      return t("cookGoalLowCarb");
    case "budget_friendly":
      return t("cookGoalBudgetFriendly");
    default:
      return t("cookGoalBalanced");
  }
};

export const getServingsLabel = (t: (key: string) => string, value: string) => {
  switch (value as CookServingOption) {
    case "1":
      return t("cookServing1");
    case "2":
      return t("cookServing2");
    default:
      return t("cookServing4");
  }
};

export const getCaloriesLabel = (
  t: (key: string) => string,
  value: string,
) => {
  switch (value as CookMaxCaloriesOption) {
    case "400":
      return t("cookCalories400");
    case "600":
      return t("cookCalories600");
    case "800":
      return t("cookCalories800");
    case "1000":
      return t("cookCalories1000");
    default:
      return t("cookCaloriesAny");
  }
};
