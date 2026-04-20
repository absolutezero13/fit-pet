import { create } from "zustand";

export enum GoalEnum {
  LoseWeight = "loseWeight",
  GainMuscle = "gainMuscle",
  EatHealthier = "eatHealthier",
  GetMoreSleep = "getMoreSleep",
  DrinkMoreWater = "drinkMoreWater",
  ReduceStress = "reduceStress",
  ReduceAlcohol = "reduceAlcohol",
  GetMoreActive = "getMoreActive",
}

export enum DietTypeEnum {
  Regular = "regular",
  Vegetarian = "vegetarian",
  Vegan = "vegan",
  Pescatarian = "pescatarian",
  Flexitarian = "flexitarian",
  Keto = "keto",
  LowCarb = "low_carb",
  IntermittentFasting = "intermittent_fasting",
  Paleo = "paleo",
  Western = "western",
}

export enum GenderEnum {
  Male = "male",
  Female = "female",
  Other = "other",
}

export interface OnboardingStore {
  goals?: GoalEnum[];
  gender?: GenderEnum | null;
  yearOfBirth?: number;
  weight?: number | null;
  height?: number | null;
  dietTypes?: DietTypeEnum[];
  allergens?: string[];
  kitchenEquipment?: string[];
}

export const INITIAL_ONBOARDING_STATE: OnboardingStore = {
  goals: [],
  gender: null,
  yearOfBirth: new Date().getFullYear() - 24,
  weight: 65,
  height: 170,
  dietTypes: [],
};
const useOnboardingStore = create<OnboardingStore>(
  () => INITIAL_ONBOARDING_STATE
);

export default useOnboardingStore;
