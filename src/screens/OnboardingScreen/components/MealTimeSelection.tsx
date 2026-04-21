import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
import GlassView from "../../../components/SafeGlassView";

interface MealTimeRowProps {
  label: string;
  time: MealTime;
  onChangeTime: (time: MealTime) => void;
  icon: string;
}

const MealTimeRow: React.FC<MealTimeRowProps> = ({
  label,
  time,
  onChangeTime,
  icon,
}) => {
  const { colors } = useTheme();

  const handleAdjustTime = (increment: number) => {
    onChangeTime(adjustMealTime(time, increment));
  };

  return (
    <View style={styles.mealTimeRow}>
      <View style={styles.mealHeader}>
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={scale(22)}
          color={colors.text}
        />
        <Text style={[styles.mealLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.timePickerContainer}>
        <GlassView
          effect="clear"
          interactive
          style={[styles.glassButton, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity
            onPress={() => handleAdjustTime(-TIME_ADJUSTMENT_INCREMENT)}
            style={styles.glassButtonInner}
          >
            <MaterialCommunityIcons
              name="minus"
              size={scale(24)}
              color={colors.text}
            />
          </TouchableOpacity>
        </GlassView>
        <Text style={[styles.timeText, { color: colors.text }]}>
          {formatMealTime(time)}
        </Text>
        <GlassView
          effect="clear"
          interactive
          style={[styles.glassButton, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity
            onPress={() => handleAdjustTime(TIME_ADJUSTMENT_INCREMENT)}
            style={styles.glassButtonInner}
          >
            <MaterialCommunityIcons
              name="plus"
              size={scale(24)}
              color={colors.text}
            />
          </TouchableOpacity>
        </GlassView>
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
    notificationStore.breakfastTime,
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
        t("mealReminderBody"),
      );
    } else {
      Alert.alert(
        t("notificationPermissionDenied"),
        t("notificationPermissionDeniedMessage"),
      );
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
      <View style={[styles.card, {}]}>
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
    paddingTop: scale(16),
  },
  description: {
    ...fontStyles.body1,
  },
  card: {
    borderRadius: scale(16),
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  mealTimeRow: {
    alignItems: "center",
    paddingVertical: scale(20),
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
    marginBottom: scale(16),
  },
  mealLabel: {
    ...fontStyles.headline3,
    alignSelf: "center",
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: scale(8),
  },
  glassButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
  },
  glassButtonInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    ...fontStyles.headline1,
    fontSize: scale(40),
    lineHeight: scale(52),
    flex: 1,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    alignSelf: "center",
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
