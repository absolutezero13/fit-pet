import api from "./api";
import { IMeal } from "./apiTypes";

export const createMeal = async (meal: IMeal) => {
  try {
    console.log("CREATE MEAL", meal);
    const res = await api.post("/meal-analysis", meal);
    console.log("CREATE MEAL RESPONSE", res.data);
    return res.data;
  } catch (error) {
    console.log("CREATE MEAL ERROR", error);
    return error as any;
  }
};

export const deleteMeal = async (id: string) => {
  try {
    const res = await api.delete(`/meal-analysis/${id}`);
    return res.data;
  } catch (error) {
    console.log("DELETE MEAL ERROR", error);
    return error as any;
  }
};

export const updateMeal = async (meal: IMeal) => {
  try {
    const res = await api.put(`/meal-analysis/${meal.id}`, meal);
    return res.data;
  } catch (error) {
    console.log("UPDATE MEAL ERROR", error);
    return error as any;
  }
};

export const getMealsByDate = async (date: string) => {
  try {
    const res = await api.get(`/meal-analysis`, {
      params: {
        date,
      },
    });
    return res.data;
  } catch (error) {
    console.log("GET MEALS BY DATE ERROR", error);
    return error as any;
  }
};
