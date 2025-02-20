import { create } from "zustand";
import { Gender } from "../screens/components/types";

interface OnboardingStore {
  goals: { title: string; key: string }[];
  gender: Gender | "";
  age: number | null;
  weight: number | null;
  height: number | null;
}

const useOnboardingStore = create<OnboardingStore>(() => ({
  goals: [],
  gender: "",
  age: null,
  weight: null,
  height: null,
}));

export default useOnboardingStore;
