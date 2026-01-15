import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import useNotificationStore, {
  MealTime,
  MealType,
} from "../../../zustand/useNotificationStore";
import notificationService from "../../../services/notificationService";

interface MealTimeRowProps {
  label: string;
  time: MealTime;
  onChangeTime: (time: MealTime) => void;
  icon: string;
}

const formatTime = (time: MealTime): string => {
  const hours = time.hour.toString().padStart(2, "0");
  const minutes = time.minute.toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const MealTimeRow: React.FC<MealTimeRowProps> = ({
  label,
  time,
  onChangeTime,
  icon,
}) => {
  const { colors } = useTheme();

  const adjustTime = (increment: number) => {
    let newMinute = time.minute + increment;
    let newHour = time.hour;

    if (newMinute >= 60) {
      newMinute = 0;
      newHour = (newHour + 1) % 24;
    } else if (newMinute < 0) {
      newMinute = 30;
      newHour = newHour === 0 ? 23 : newHour - 1;
    }

    onChangeTime({ hour: newHour, minute: newMinute });
  };

  return (
    <View style={[styles.mealTimeRow, { borderBottomColor: colors.border }]}>
      <View style={styles.mealLabelContainer}>
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={scale(24)}
          color={colors.text}
        />
        <Text style={[styles.mealLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.timePickerContainer}>
        <TouchableOpacity
          onPress={() => adjustTime(-30)}
          style={styles.timeButton}
        >
          <MaterialCommunityIcons
            name="minus"
            size={scale(20)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.timeText, { color: colors.text }]}>
          {formatTime(time)}
        </Text>
        <TouchableOpacity
          onPress={() => adjustTime(30)}
          style={styles.timeButton}
        >
          <MaterialCommunityIcons
            name="plus"
            size={scale(20)}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface MealTimeSelectionProps {
  focused?: boolean;
}

const MealTimeSelection: React.FC<MealTimeSelectionProps> = ({ focused }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const notificationStore = useNotificationStore();

  const [breakfastTime, setBreakfastTime] = useState(
    notificationStore.breakfastTime
  );
  const [lunchTime, setLunchTime] = useState(notificationStore.lunchTime);
  const [dinnerTime, setDinnerTime] = useState(notificationStore.dinnerTime);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const handleBreakfastTimeChange = (time: MealTime) => {
    setBreakfastTime(time);
    notificationStore.setBreakfastTime(time);
  };

  const handleLunchTimeChange = (time: MealTime) => {
    setLunchTime(time);
    notificationStore.setLunchTime(time);
  };

  const handleDinnerTimeChange = (time: MealTime) => {
    setDinnerTime(time);
    notificationStore.setDinnerTime(time);
  };

  const requestPermissionAndEnable = async () => {
    if (permissionRequested) return;

    setPermissionRequested(true);
    const granted = await notificationService.requestPermission();

    if (granted) {
      notificationStore.setNotificationsEnabled(true);

      // Schedule dinner reminder (progressive: only dinner at start)
      await notificationService.scheduleMealReminder(
        "dinner",
        dinnerTime,
        t("dinnerReminder"),
        t("mealReminderBody")
      );
    } else {
      Alert.alert(t("notificationPermissionDenied"), t("notificationPermissionDeniedMessage"));
    }
  };

  React.useEffect(() => {
    if (focused && !permissionRequested) {
      // Auto-request permission when this screen is focused
      requestPermissionAndEnable();
    }
  }, [focused]);

  return (
    <View style={styles.container}>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t("mealTimeDescription")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <MealTimeRow
          label={t("breakfast")}
          time={breakfastTime}
          onChangeTime={handleBreakfastTimeChange}
          icon="food-croissant"
        />
        <MealTimeRow
          label={t("lunch")}
          time={lunchTime}
          onChangeTime={handleLunchTimeChange}
          icon="food"
        />
        <MealTimeRow
          label={t("dinner")}
          time={dinnerTime}
          onChangeTime={handleDinnerTimeChange}
          icon="silverware-fork-knife"
        />
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name="bell-ring-outline"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t("dinnerReminderInfo")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
  },
  description: {
    ...fontStyles.body1,
    marginBottom: scale(24),
  },
  card: {
    borderRadius: scale(16),
    padding: scale(16),
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  mealTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(16),
    borderBottomWidth: 1,
  },
  mealLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  mealLabel: {
    ...fontStyles.headline4,
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  timeButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    ...fontStyles.headline3,
    minWidth: scale(60),
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    marginTop: scale(16),
    padding: scale(16),
    borderRadius: scale(12),
  },
  infoText: {
    ...fontStyles.body2,
    flex: 1,
  },
});

export default MealTimeSelection;
