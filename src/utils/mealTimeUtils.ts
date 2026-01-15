import { MealTime } from "../zustand/useNotificationStore";

/**
 * Format a MealTime object to a string like "08:00" or "19:30"
 */
export const formatMealTime = (time: MealTime): string => {
  const hours = time.hour.toString().padStart(2, "0");
  const minutes = time.minute.toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Adjust a meal time by a given number of minutes.
 * Handles hour overflow/underflow.
 * @param time Current meal time
 * @param incrementMinutes Number of minutes to add (negative to subtract)
 * @returns New MealTime object
 */
export const adjustMealTime = (
  time: MealTime,
  incrementMinutes: number
): MealTime => {
  let newMinute = time.minute + incrementMinutes;
  let newHour = time.hour;

  if (newMinute >= 60) {
    newMinute = 0;
    newHour = (newHour + 1) % 24;
  } else if (newMinute < 0) {
    newMinute = 30;
    newHour = newHour === 0 ? 23 : newHour - 1;
  }

  return { hour: newHour, minute: newMinute };
};
