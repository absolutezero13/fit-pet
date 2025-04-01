import { create } from "zustand";
import { Gender } from "../screens/OnboardingScreen/components/types";

export interface OnboardingStore {
  goals: { title: string; key: string }[];
  gender: Gender | null;
  age: number | null;
  weight: number | null;
  height: number | null;
}

export const INITIAL_ONBOARDING_STATE: OnboardingStore = {
  goals: [],
  gender: null,
  age: 24,
  weight: null,
  height: null,
};
const useOnboardingStore = create<OnboardingStore>(
  () => INITIAL_ONBOARDING_STATE
);

export default useOnboardingStore;
