import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TrueSheet } from "../../../components/TrueSheet";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TrueSheetNames } from "../../../navigation/constants";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import AppButton from "../../../components/AppButton";
import userService from "../../../services/user";
import useUserStore from "../../../zustand/useUserStore";
import { GoalEnum } from "../../../zustand/useOnboardingStore";
import { goalItems } from "../../OnboardingScreen/components/Goal";
import SettingsSheet from "./SettingsSheet";

type GoalOptionCardProps = {
  goal: (typeof goalItems)[number];
  selectedGoals: GoalEnum[];
  onToggleGoal: (goal: GoalEnum) => void;
};

const GoalOptionCard = ({
  goal,
  selectedGoals,
  onToggleGoal,
}: GoalOptionCardProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const Icon = goal.iconComponent;
  const isSelected = selectedGoals.includes(goal.key);

  const handlePress = () => {
    onToggleGoal(goal.key);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.goalCard,
        {
          backgroundColor: isSelected
            ? colors.accentSoft
            : colors.backgroundSecondary,
          borderColor: isSelected ? colors.accent : "transparent",
        },
      ]}
    >
      <View style={styles.goalRowContent}>
        <View
          style={[
            styles.goalIconWrap,
            {
              backgroundColor: isSelected ? colors.accent : colors.surface,
            },
          ]}
        >
          <Icon color={isSelected ? colors.textInverse : colors.text} />
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.goalLabel,
            { color: isSelected ? colors.text : colors.textSecondary },
          ]}
        >
          {t(goal.titleKey)}
        </Text>
      </View>

      {isSelected ? (
        <View
          style={[styles.selectionCheck, { backgroundColor: colors.accent }]}
        >
          <Ionicons
            name="checkmark"
            size={scale(14)}
            color={colors.textInverse}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const GoalsSettingsSheet = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const user = useUserStore();
  const currentGoals = user?.onboarding?.goals || [];
  const currentHeight = user?.onboarding?.height ?? 170;
  const currentWeight = user?.onboarding?.weight ?? 70;
  const [draftGoals, setDraftGoals] = useState<GoalEnum[]>(currentGoals);
  const [saving, setSaving] = useState(false);

  const surfaceCardStyle = {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0.28 : 0.12,
  };

  const handleWillPresent = () => {
    setDraftGoals(currentGoals);
  };

  const handleToggleGoal = (goal: GoalEnum) => {
    setDraftGoals((existingGoals) => {
      if (existingGoals.includes(goal)) {
        return existingGoals.filter((existingGoal) => existingGoal !== goal);
      }

      return [...existingGoals, goal];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.createOrUpdateUser({
        onboarding: {
          goals: draftGoals,
          height: currentHeight,
          weight: currentWeight,
        },
      });
      await TrueSheet.dismiss(TrueSheetNames.SETTINGS_GOALS);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSheet
      name={TrueSheetNames.SETTINGS_GOALS}
      title={t("goals")}
      onWillPresent={handleWillPresent}
      footer={
        <AppButton
          title={t("save")}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          margin={{ marginHorizontal: scale(24) }}
        />
      }
    >
      <View style={[styles.card, surfaceCardStyle]}>
        <View style={styles.goalsGrid}>
          {goalItems.map((goal) => (
            <GoalOptionCard
              key={goal.key}
              goal={goal}
              selectedGoals={draftGoals}
              onToggleGoal={handleToggleGoal}
            />
          ))}
        </View>
      </View>
    </SettingsSheet>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(28),
    padding: scale(18),
  },
  goalsGrid: {
    gap: scale(10),
  },
  goalCard: {
    alignItems: "center",
    borderRadius: scale(20),
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: scale(64),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
  },
  goalRowContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  goalIconWrap: {
    alignItems: "center",
    borderRadius: scale(18),
    height: scale(44),
    justifyContent: "center",
    width: scale(44),
  },
  selectionCheck: {
    alignItems: "center",
    borderRadius: scale(11),
    height: scale(22),
    justifyContent: "center",
    width: scale(22),
  },
  goalLabel: {
    ...fontStyles.body1Bold,
    flex: 1,
    marginLeft: scale(12),
    marginRight: scale(12),
  },
});

export default GoalsSettingsSheet;
