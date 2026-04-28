import api from "./api";
import { CookRecipe } from "./apiTypes";

export interface PersistedCookRecipe {
  id?: string;
  userId?: string;
  recipe: CookRecipe;
  savedAt: string;
}

export const saveCookRecipe = async (
  recipe: CookRecipe,
): Promise<PersistedCookRecipe | null> => {
  try {
    const res = await api.post("/cook-recipe", {
      recipe,
      savedAt: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.log("SAVE COOK RECIPE ERROR", error);
    return null;
  }
};

export const listCookRecipes = async (): Promise<PersistedCookRecipe[]> => {
  try {
    const res = await api.get("/cook-recipe");
    return res.data ?? [];
  } catch (error) {
    console.log("LIST COOK RECIPES ERROR", error);
    return [];
  }
};

export const deleteCookRecipe = async (recipeId: string): Promise<boolean> => {
  try {
    await api.delete(`/cook-recipe/${recipeId}`);
    return true;
  } catch (error) {
    console.log("DELETE COOK RECIPE ERROR", error);
    return false;
  }
};
