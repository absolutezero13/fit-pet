import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import useNotificationStore, {
  MealTime,
} from "../../../zustand/useNotificationStore";
import notificationService from "../../../services/notificationService";
import {
  formatMealTime,
  adjustMealTime,
  TIME_ADJUSTMENT_INCREMENT,
} from "../../../utils/mealTimeUtils";

interface MealReminderRowProps {
  label: string;
  time: MealTime;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onChangeTime: (time: MealTime) => void;
  icon: string;
}

const MealReminderRow: React.FC<MealReminderRowProps> = ({
  label,
  time,
  enabled,
  onToggle,
  onChangeTime,
  icon,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleAdjustTime = (increment: number) => {
    if (!enabled) return;
    onChangeTime(adjustMealTime(time, increment));
  };

  return (
    <View style={[styles.mealRow, { borderBottomColor: colors.border }]}>
      <View style={styles.rowTop}>
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={scale(20)}
            color={colors.text}
          />
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{
            false: colors.border,
            true: colors["color-success-400"],
          }}
        />
      </View>
      {enabled && (
        <View style={styles.timeRow}>
          <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
            {t("reminderTime")}:
          </Text>
          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              onPress={() => handleAdjustTime(-TIME_ADJUSTMENT_INCREMENT)}
              style={styles.timeButton}
            >
              <MaterialCommunityIcons
                name="minus"
                size={scale(16)}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatMealTime(time)}
            </Text>
            <TouchableOpacity
              onPress={() => handleAdjustTime(TIME_ADJUSTMENT_INCREMENT)}
              style={styles.timeButton}
            >
              <MaterialCommunityIcons
                name="plus"
                size={scale(16)}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const store = useNotificationStore();

  const [globalEnabled, setGlobalEnabled] = useState(
    store.notificationsEnabled,
  );
  const [breakfastEnabled, setBreakfastEnabled] = useState(
    store.breakfastEnabled,
  );
  const [lunchEnabled, setLunchEnabled] = useState(store.lunchEnabled);
  const [dinnerEnabled, setDinnerEnabled] = useState(store.dinnerEnabled);
  const [breakfastTime, setBreakfastTime] = useState(store.breakfastTime);
  const [lunchTime, setLunchTime] = useState(store.lunchTime);
  const [dinnerTime, setDinnerTime] = useState(store.dinnerTime);

  const rescheduleNotifications = async () => {
    await notificationService.rescheduleAllNotifications(
      {
        breakfast: t("breakfastReminder"),
        lunch: t("lunchReminder"),
        dinner: t("dinnerReminder"),
      },
      t("mealReminderBody"),
    );
  };

  const handleGlobalToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        Alert.alert(
          t("notificationPermissionDenied"),
          t("notificationPermissionDeniedMessage"),
        );
        return;
      }
    }

    setGlobalEnabled(enabled);
    store.setNotificationsEnabled(enabled);

    if (!enabled) {
      await notificationService.cancelAllReminders();
    } else {
      await rescheduleNotifications();
    }
  };

  const handleBreakfastToggle = async (enabled: boolean) => {
    setBreakfastEnabled(enabled);
    store.setBreakfastEnabled(enabled);
    await rescheduleNotifications();
  };

  const handleLunchToggle = async (enabled: boolean) => {
    setLunchEnabled(enabled);
    store.setLunchEnabled(enabled);
    await rescheduleNotifications();
  };

  const handleDinnerToggle = async (enabled: boolean) => {
    setDinnerEnabled(enabled);
    store.setDinnerEnabled(enabled);
    await rescheduleNotifications();
  };

  const handleBreakfastTimeChange = async (time: MealTime) => {
    setBreakfastTime(time);
    store.setBreakfastTime(time);
    await rescheduleNotifications();
  };

  const handleLunchTimeChange = async (time: MealTime) => {
    setLunchTime(time);
    store.setLunchTime(time);
    await rescheduleNotifications();
  };

  const handleDinnerTimeChange = async (time: MealTime) => {
    setDinnerTime(time);
    store.setDinnerTime(time);
    await rescheduleNotifications();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("notifications")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Global toggle */}
        <View style={[styles.globalRow, { borderBottomColor: colors.border }]}>
          <View style={styles.labelContainer}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={scale(20)}
              color={colors.text}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {t("enableNotifications")}
            </Text>
          </View>
          <Switch
            value={globalEnabled}
            onValueChange={handleGlobalToggle}
            trackColor={{
              false: colors.border,
              true: colors["color-success-400"],
            }}
          />
        </View>

        {globalEnabled && (
          <>
            <MealReminderRow
              label={t("breakfast")}
              time={breakfastTime}
              enabled={breakfastEnabled}
              onToggle={handleBreakfastToggle}
              onChangeTime={handleBreakfastTimeChange}
              icon="food-croissant"
            />
            <MealReminderRow
              label={t("lunch")}
              time={lunchTime}
              enabled={lunchEnabled}
              onToggle={handleLunchToggle}
              onChangeTime={handleLunchTimeChange}
              icon="food"
            />
            <MealReminderRow
              label={t("dinner")}
              time={dinnerTime}
              enabled={dinnerEnabled}
              onToggle={handleDinnerToggle}
              onChangeTime={handleDinnerTimeChange}
              icon="silverware-fork-knife"
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    ...fontStyles.headline2,
    marginBottom: scale(12),
  },
  card: {
    borderRadius: scale(32),
    padding: scale(16),
    paddingHorizontal: scale(24),
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  globalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
  },
  mealRow: {
    paddingVertical: scale(12),
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  label: {
    ...fontStyles.headline4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: scale(8),
    paddingLeft: scale(28),
  },
  timeLabel: {
    ...fontStyles.body2,
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  timeButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    ...fontStyles.headline4,
    minWidth: scale(50),
    textAlign: "center",
  },
});

export default NotificationSettings;
