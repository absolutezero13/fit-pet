import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TrueSheet } from "../../../components/TrueSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TrueSheetNames } from "../../../navigation/constants";
import AppButton from "../../../components/AppButton";
import notificationService from "../../../services/notificationService";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";
import useNotificationStore, {
  MealTime,
} from "../../../zustand/useNotificationStore";
import {
  TIME_ADJUSTMENT_INCREMENT,
  adjustMealTime,
  formatMealTime,
} from "../../../utils/mealTimeUtils";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface MealReminderCardProps {
  label: string;
  time: MealTime;
  enabled: boolean;
  globalEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onChangeTime: (time: MealTime) => void;
  icon: MaterialIconName;
  accentColor: string;
}

type Props = {
  resetSignal?: number;
  submitSignal?: number;
  showSectionTitle?: boolean;
};

const MealReminderCard = ({
  label,
  time,
  enabled,
  globalEnabled,
  onToggle,
  onChangeTime,
  icon,
  accentColor,
}: MealReminderCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isInteractive = globalEnabled && enabled;

  const handleDecreaseTime = () => {
    if (!isInteractive) {
      return;
    }

    onChangeTime(adjustMealTime(time, -TIME_ADJUSTMENT_INCREMENT));
  };

  const handleIncreaseTime = () => {
    if (!isInteractive) {
      return;
    }

    onChangeTime(adjustMealTime(time, TIME_ADJUSTMENT_INCREMENT));
  };

  return (
    <View
      style={[
        styles.mealCard,
        {
          backgroundColor:
            globalEnabled && enabled
              ? `${accentColor}14`
              : colors.backgroundSecondary,
          borderColor:
            globalEnabled && enabled ? `${accentColor}55` : "transparent",
          opacity: isInteractive ? 1 : 0.55,
        },
      ]}
    >
      <View style={styles.mealTopRow}>
        <View style={styles.mealInfo}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor:
                  globalEnabled && enabled ? accentColor : colors.surface,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={scale(18)}
              color={
                globalEnabled && enabled ? colors.textInverse : colors.text
              }
            />
          </View>

          <Text style={[styles.mealLabel, { color: colors.text }]}>
            {label}
          </Text>
        </View>

        <Switch
          disabled={!globalEnabled}
          onValueChange={onToggle}
          trackColor={{
            false: colors.border,
            true: accentColor,
          }}
          value={enabled}
        />
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
          {t("reminderTime")}
        </Text>

        <View style={[styles.timeControl, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!isInteractive}
            onPress={handleDecreaseTime}
            style={[
              styles.timeButton,
              {
                backgroundColor: colors.backgroundSecondary,
                opacity: isInteractive ? 1 : 0.5,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="minus"
              size={scale(16)}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.timeValue,
              { color: isInteractive ? colors.text : colors.textSecondary },
            ]}
          >
            {formatMealTime(time)}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!isInteractive}
            onPress={handleIncreaseTime}
            style={[
              styles.timeButton,
              {
                backgroundColor: colors.backgroundSecondary,
                opacity: isInteractive ? 1 : 0.5,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="plus"
              size={scale(16)}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const NotificationSettings: React.FC<Props> = ({
  resetSignal = 0,
  submitSignal = 0,
  showSectionTitle = true,
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGlobalEnabled(store.notificationsEnabled);
    setBreakfastEnabled(store.breakfastEnabled);
    setLunchEnabled(store.lunchEnabled);
    setDinnerEnabled(store.dinnerEnabled);
    setBreakfastTime(store.breakfastTime);
    setLunchTime(store.lunchTime);
    setDinnerTime(store.dinnerTime);
  }, [
    resetSignal,
    store.notificationsEnabled,
    store.breakfastEnabled,
    store.lunchEnabled,
    store.dinnerEnabled,
    store.breakfastTime,
    store.lunchTime,
    store.dinnerTime,
  ]);

  const surfaceCardStyle = {
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0.28 : 0.12,
  };

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

  const handleSave = async () => {
    try {
      setSaving(true);

      if (globalEnabled) {
        const granted = await notificationService.requestPermission();

        if (!granted) {
          Alert.alert(
            t("notificationPermissionDenied"),
            t("notificationPermissionDeniedMessage"),
          );
          return;
        }
      }

      useNotificationStore.setState({
        notificationsEnabled: globalEnabled,
        breakfastEnabled,
        lunchEnabled,
        dinnerEnabled,
        breakfastTime,
        lunchTime,
        dinnerTime,
      });

      if (!globalEnabled) {
        await notificationService.cancelAllReminders();
      } else {
        await rescheduleNotifications();
      }

      await TrueSheet.dismiss(TrueSheetNames.SETTINGS_NOTIFICATIONS);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (submitSignal === 0) {
      return;
    }

    handleSave();
  }, [submitSignal]);

  return (
    <View
      style={[styles.container, !showSectionTitle && styles.containerEmbedded]}
    >
      {showSectionTitle ? (
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t("notifications")}
        </Text>
      ) : null}

      <View style={[styles.card, surfaceCardStyle]}>
        <View
          style={[
            styles.headerRow,
            {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerInfo}>
            <View
              style={[
                styles.headerIconWrap,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={scale(20)}
                color={colors.text}
              />
            </View>

            <View style={styles.headerCopy}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t("enableNotifications")}
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                {t("mealTimeDescription")}
              </Text>
            </View>
          </View>

          <Switch
            onValueChange={setGlobalEnabled}
            trackColor={{
              false: colors.border,
              true: colors.accent,
            }}
            value={globalEnabled}
          />
        </View>

        <View style={styles.mealCardsWrap}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
            {t("mealReminders")}
          </Text>

          <MealReminderCard
            accentColor={colors.accent}
            enabled={breakfastEnabled}
            globalEnabled={globalEnabled}
            icon="food-croissant"
            label={t("breakfast")}
            onChangeTime={setBreakfastTime}
            onToggle={setBreakfastEnabled}
            time={breakfastTime}
          />

          <MealReminderCard
            accentColor={colors.accent}
            enabled={lunchEnabled}
            globalEnabled={globalEnabled}
            icon="food"
            label={t("lunch")}
            onChangeTime={setLunchTime}
            onToggle={setLunchEnabled}
            time={lunchTime}
          />

          <MealReminderCard
            accentColor={colors.accent}
            enabled={dinnerEnabled}
            globalEnabled={globalEnabled}
            icon="silverware-fork-knife"
            label={t("dinner")}
            onChangeTime={setDinnerTime}
            onToggle={setDinnerEnabled}
            time={dinnerTime}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(24),
  },
  containerEmbedded: {
    marginBottom: 0,
  },
  sectionTitle: {
    ...fontStyles.body2,
    letterSpacing: scale(1.1),
    marginBottom: scale(10),
    textTransform: "uppercase",
  },
  card: {
    borderRadius: scale(28),
    padding: scale(18),
    width: "100%",
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    shadowRadius: scale(18),
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: scale(14),
  },
  headerInfo: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  headerIconWrap: {
    alignItems: "center",
    borderRadius: scale(16),
    height: scale(44),
    justifyContent: "center",
    marginRight: scale(12),
    width: scale(44),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    ...fontStyles.headline4,
  },
  headerSubtitle: {
    ...fontStyles.body2,
    marginTop: scale(2),
  },
  mealCardsWrap: {
    gap: scale(10),
    paddingTop: scale(14),
  },
  groupLabel: {
    ...fontStyles.body2,
    letterSpacing: scale(0.8),
    textTransform: "uppercase",
  },
  mealCard: {
    borderRadius: scale(20),
    borderWidth: 1,
    padding: scale(14),
  },
  mealTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealInfo: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: scale(12),
    height: scale(36),
    justifyContent: "center",
    marginRight: scale(10),
    width: scale(36),
  },
  mealLabel: {
    ...fontStyles.body1,
    flexShrink: 1,
  },
  timeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: scale(12),
  },
  timeLabel: {
    ...fontStyles.body2,
  },
  timeControl: {
    alignItems: "center",
    borderRadius: scale(16),
    flexDirection: "row",
    gap: scale(6),
    padding: scale(5),
  },
  timeButton: {
    alignItems: "center",
    borderRadius: scale(12),
    height: scale(36),
    justifyContent: "center",
    width: scale(36),
  },
  timeValue: {
    ...fontStyles.body1,
    fontVariant: ["tabular-nums"],
    minWidth: scale(68),
    textAlign: "center",
  },
});

export default NotificationSettings;
