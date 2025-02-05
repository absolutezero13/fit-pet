import { create } from "zustand";

interface OnboardingStore {
  goals: { title: string; key: string }[];
  gender: string;
  age: number | null;
}

const useOnboardingStore = create<OnboardingStore>(() => ({
  goals: [],
  gender: "",
  age: null,
}));

export default useOnboardingStore;
