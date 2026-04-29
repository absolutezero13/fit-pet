import { NativeModules, Platform } from "react-native";

type LiveActivityPayload = {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinsGrams: number;
  proteinsGoal: number;
  carbsGrams: number;
  carbsGoal: number;
  fatsGrams: number;
  fatsGoal: number;
  lastMealTitle: string;
  lastMealEmoji: string;
  mealCount: number;
};

type MealLiveActivityModule = {
  isSupported?: boolean;
  start(payload: LiveActivityPayload): Promise<string>;
  update(payload: LiveActivityPayload): Promise<string>;
  end(): Promise<void>;
};

const LiveActivityModule = (NativeModules.MealLiveActivity ??
  null) as MealLiveActivityModule | null;

export const isLiveActivitySupported = (): boolean => {
  if (Platform.OS !== "ios") return false;
  return Boolean(LiveActivityModule?.isSupported);
};

export const startMealLiveActivity = async (
  payload: LiveActivityPayload,
): Promise<string | undefined> => {
  if (!isLiveActivitySupported() || !LiveActivityModule) return;
  try {
    return await LiveActivityModule.start(payload);
  } catch (err) {
    console.warn("[LiveActivity] start failed", err);
    return "";
  }
};

export const updateMealLiveActivity = async (
  payload: LiveActivityPayload,
): Promise<string | undefined> => {
  if (!isLiveActivitySupported() || !LiveActivityModule) return;
  try {
    return await LiveActivityModule.update(payload);
  } catch (err) {
    console.warn("[LiveActivity] update failed", err);
    return "";
  }
};

export const endMealLiveActivity = async (): Promise<void> => {
  if (!isLiveActivitySupported() || !LiveActivityModule) return;
  try {
    await LiveActivityModule.end();
  } catch (err) {
    console.warn("[LiveActivity] end failed", err);
  }
};

export type { LiveActivityPayload };
