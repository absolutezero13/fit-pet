import { Platform, PermissionsAndroid } from "react-native";
import useNotificationStore, {
  MealType,
  MealTime,
} from "../zustand/useNotificationStore";
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
  type TimestampTrigger,
} from "@notifee/react-native";

const NOTIFICATION_IDS = {
  breakfast: "meal-reminder-breakfast",
  lunch: "meal-reminder-lunch",
  dinner: "meal-reminder-dinner",
};

const CHANNEL_ID = "meal-reminders";

const ANDROID_API_LEVEL_TIRAMISU = 33;

const getNotifee = async () => notifee;

class NotificationService {
  private initialized = false;

  /**
   * Initialize the notification service
   * Creates Android notification channel
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const notifeeModule = await getNotifee();
    if (!notifeeModule) return;

    try {
      // Create Android notification channel
      if (Platform.OS === "android") {
        await notifeeModule.createChannel({
          id: CHANNEL_ID,
          name: "Meal Reminders",
          importance: AndroidImportance.HIGH,
        });
      }
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
    }
  }

  /**
   * Request notification permissions
   * @returns true if permission granted, false otherwise
   */
  async requestPermission(): Promise<boolean> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return false;

    try {
      // For Android 13+ (API level 33), we need to request POST_NOTIFICATIONS permission
      if (
        Platform.OS === "android" &&
        typeof Platform.Version === "number" &&
        Platform.Version >= ANDROID_API_LEVEL_TIRAMISU
      ) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }

      const settings = await notifeeModule.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  /**
   * Check if notifications are currently authorized
   */
  async checkPermission(): Promise<boolean> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return false;

    try {
      const settings = await notifeeModule.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch {
      return false;
    }
  }

  /**
   * Schedule a meal reminder notification
   */
  async scheduleMealReminder(
    mealType: MealType,
    time: MealTime,
    title: string,
    body: string,
  ): Promise<void> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return;

    await this.initialize();

    try {
      const notificationId = NOTIFICATION_IDS[mealType];

      // Cancel existing notification for this meal type first
      await this.cancelMealReminder(mealType);

      // Calculate next trigger time
      const trigger = this.createDailyTrigger(time);

      await notifeeModule.createTriggerNotification(
        {
          id: notificationId,
          title,
          body,
          android: {
            channelId: CHANNEL_ID,
            pressAction: {
              id: "default",
            },
          },
          ios: {
            sound: "default",
          },
        },
        trigger,
      );
    } catch (error) {
      console.error(`Failed to schedule ${mealType} reminder:`, error);
    }
  }

  /**
   * Cancel a specific meal reminder
   */
  async cancelMealReminder(mealType: MealType): Promise<void> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return;

    try {
      await notifeeModule.cancelNotification(NOTIFICATION_IDS[mealType]);
    } catch (error) {
      console.error(`Failed to cancel ${mealType} reminder:`, error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    await Promise.all([
      this.cancelMealReminder("breakfast"),
      this.cancelMealReminder("lunch"),
      this.cancelMealReminder("dinner"),
    ]);
  }

  async rescheduleAllNotifications(
    titles: Record<MealType, string>,
    body: string,
  ): Promise<void> {
    const store = useNotificationStore.getState();

    if (!store.notificationsEnabled) {
      await this.cancelAllReminders();
      return;
    }

    if (store.dinnerEnabled) {
      await this.scheduleMealReminder(
        "dinner",
        store.dinnerTime,
        titles.dinner,
        body,
      );
    } else {
      await this.cancelMealReminder("dinner");
    }

    if (store.breakfastEnabled) {
      await this.scheduleMealReminder(
        "breakfast",
        store.breakfastTime,
        titles.breakfast,
        body,
      );
    } else {
      await this.cancelMealReminder("breakfast");
    }

    if (store.lunchEnabled) {
      await this.scheduleMealReminder(
        "lunch",
        store.lunchTime,
        titles.lunch,
        body,
      );
    } else {
      await this.cancelMealReminder("lunch");
    }
  }

  async getScheduledNotifications(): Promise<string[]> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return [];

    try {
      return await notifeeModule.getTriggerNotificationIds();
    } catch {
      return [];
    }
  }

  private createDailyTrigger(time: MealTime): TimestampTrigger {
    const now = new Date();
    const triggerDate = new Date();

    triggerDate.setHours(time.hour);
    triggerDate.setMinutes(time.minute);
    triggerDate.setSeconds(0);
    triggerDate.setMilliseconds(0);

    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    return {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
