import { Platform, PermissionsAndroid, Alert } from "react-native";
import useNotificationStore, {
  MealType,
  MealTime,
} from "../zustand/useNotificationStore";

// Notification IDs for each meal type
const NOTIFICATION_IDS = {
  breakfast: "meal-reminder-breakfast",
  lunch: "meal-reminder-lunch",
  dinner: "meal-reminder-dinner",
};

// Notification channel ID for Android
const CHANNEL_ID = "meal-reminders";

// Android API level 33 (Tiramisu) - first version requiring POST_NOTIFICATIONS permission
const ANDROID_API_LEVEL_TIRAMISU = 33;

interface NotifeeModule {
  requestPermission: () => Promise<{ authorizationStatus: number }>;
  createChannel: (channel: {
    id: string;
    name: string;
    importance?: number;
  }) => Promise<string>;
  createTriggerNotification: (
    notification: {
      id: string;
      title: string;
      body: string;
      android?: { channelId: string; pressAction?: { id: string } };
      ios?: { sound?: string };
    },
    trigger: { type: number; timestamp: number; repeatFrequency: number }
  ) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  getTriggerNotificationIds: () => Promise<string[]>;
  AuthorizationStatus: {
    DENIED: number;
    AUTHORIZED: number;
    PROVISIONAL: number;
    NOT_DETERMINED: number;
  };
  TriggerType: { TIMESTAMP: number };
  RepeatFrequency: { DAILY: number };
  AndroidImportance: { HIGH: number };
}

// Lazy load notifee to avoid issues in environments where it's not available
let notifee: NotifeeModule | null = null;

const getNotifee = async (): Promise<NotifeeModule | null> => {
  if (notifee) return notifee;
  try {
    notifee = (await import("@notifee/react-native")).default as NotifeeModule;
    return notifee;
  } catch {
    console.warn("Notifee not available");
    return null;
  }
};

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
          importance: notifeeModule.AndroidImportance.HIGH,
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
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }

      const settings = await notifeeModule.requestPermission();
      return (
        settings.authorizationStatus >=
        notifeeModule.AuthorizationStatus.AUTHORIZED
      );
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
      return (
        settings.authorizationStatus >=
        notifeeModule.AuthorizationStatus.AUTHORIZED
      );
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
    body: string
  ): Promise<void> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return;

    await this.initialize();

    try {
      const notificationId = NOTIFICATION_IDS[mealType];

      // Cancel existing notification for this meal type first
      await this.cancelMealReminder(mealType);

      // Calculate next trigger time
      const trigger = this.createDailyTrigger(time, notifeeModule);

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
        trigger
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

  /**
   * Cancel all meal reminders
   */
  async cancelAllReminders(): Promise<void> {
    await Promise.all([
      this.cancelMealReminder("breakfast"),
      this.cancelMealReminder("lunch"),
      this.cancelMealReminder("dinner"),
    ]);
  }

  /**
   * Reschedule all enabled notifications based on current store state
   */
  async rescheduleAllNotifications(
    titles: Record<MealType, string>,
    body: string
  ): Promise<void> {
    const store = useNotificationStore.getState();

    if (!store.notificationsEnabled) {
      await this.cancelAllReminders();
      return;
    }

    // Handle dinner (always available)
    if (store.dinnerEnabled) {
      await this.scheduleMealReminder(
        "dinner",
        store.dinnerTime,
        titles.dinner,
        body
      );
    } else {
      await this.cancelMealReminder("dinner");
    }

    // Handle breakfast (progressive)
    if (store.breakfastEnabled && store.progressiveUnlockOffered) {
      await this.scheduleMealReminder(
        "breakfast",
        store.breakfastTime,
        titles.breakfast,
        body
      );
    } else {
      await this.cancelMealReminder("breakfast");
    }

    // Handle lunch (progressive)
    if (store.lunchEnabled && store.progressiveUnlockOffered) {
      await this.scheduleMealReminder(
        "lunch",
        store.lunchTime,
        titles.lunch,
        body
      );
    } else {
      await this.cancelMealReminder("lunch");
    }
  }

  /**
   * Track meal logging for progressive enablement
   * Call this whenever a user logs a meal
   */
  trackMealLog(): void {
    const store = useNotificationStore.getState();
    const today = new Date().toISOString().split("T")[0];
    store.addMealLogDate(today);
  }

  /**
   * Check if user qualifies for progressive unlock
   * Returns true if user has logged meals on 2+ different days
   */
  shouldOfferProgressiveUnlock(): boolean {
    const store = useNotificationStore.getState();
    return store.shouldUnlockAllMeals();
  }

  /**
   * Mark progressive unlock as offered
   */
  markProgressiveUnlockOffered(): void {
    const store = useNotificationStore.getState();
    store.setProgressiveUnlockOffered(true);
  }

  /**
   * Get scheduled notification IDs
   */
  async getScheduledNotifications(): Promise<string[]> {
    const notifeeModule = await getNotifee();
    if (!notifeeModule) return [];

    try {
      return await notifeeModule.getTriggerNotificationIds();
    } catch {
      return [];
    }
  }

  /**
   * Create a daily trigger for the given time
   */
  private createDailyTrigger(
    time: MealTime,
    notifeeModule: NotifeeModule
  ): { type: number; timestamp: number; repeatFrequency: number } {
    const now = new Date();
    const triggerDate = new Date();

    triggerDate.setHours(time.hour);
    triggerDate.setMinutes(time.minute);
    triggerDate.setSeconds(0);
    triggerDate.setMilliseconds(0);

    // If the time has already passed today, schedule for tomorrow
    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    return {
      type: notifeeModule.TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      repeatFrequency: notifeeModule.RepeatFrequency.DAILY,
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
