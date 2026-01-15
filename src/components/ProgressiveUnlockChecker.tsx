import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import notificationService from "../../services/notificationService";
import useNotificationStore from "../../zustand/useNotificationStore";

/**
 * Component that checks for progressive unlock opportunities
 * and prompts user to enable breakfast/lunch reminders
 */
const ProgressiveUnlockChecker: React.FC = () => {
  const { t } = useTranslation();
  const store = useNotificationStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) return;

    const checkUnlock = async () => {
      // Only check if notifications are enabled and progressive unlock not yet offered
      if (
        !store.notificationsEnabled ||
        store.progressiveUnlockOffered
      ) {
        return;
      }

      // Check if user qualifies for unlock
      if (notificationService.shouldOfferProgressiveUnlock()) {
        setChecked(true);

        Alert.alert(
          t("unlockAllRemindersTitle"),
          t("unlockAllRemindersMessage"),
          [
            {
              text: t("maybeLater"),
              style: "cancel",
              onPress: () => {
                // Mark as offered but don't enable
                notificationService.markProgressiveUnlockOffered();
              },
            },
            {
              text: t("enableNow"),
              onPress: async () => {
                // Enable breakfast and lunch
                store.setBreakfastEnabled(true);
                store.setLunchEnabled(true);
                notificationService.markProgressiveUnlockOffered();

                // Reschedule all notifications
                await notificationService.rescheduleAllNotifications(
                  {
                    breakfast: t("breakfastReminder"),
                    lunch: t("lunchReminder"),
                    dinner: t("dinnerReminder"),
                  },
                  t("mealReminderBody")
                );
              },
            },
          ]
        );
      }
    };

    // Small delay to avoid checking immediately on mount
    const timer = setTimeout(checkUnlock, 2000);
    return () => clearTimeout(timer);
  }, [store.mealLogDates, store.notificationsEnabled, checked]);

  return null;
};

export default ProgressiveUnlockChecker;
