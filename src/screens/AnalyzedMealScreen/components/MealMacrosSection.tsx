import React, { FC } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import MacroCard from "../../../components/MacroCard";

type Props = {
  proteins: number;
  carbs: number;
  fats: number;
  variant?: "remaining" | "content";
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
};

const MealMacrosSection: FC<Props> = ({
  proteins,
  carbs,
  fats,
  variant = "content",
  proteinGoal = 0,
  carbsGoal = 0,
  fatsGoal = 0,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <Text style={[styles.sectionHeading, { color: colors.text }]}>
        {t("macronutrients")}
      </Text>
      <View style={styles.macrosContainer}>
        <MacroCard
          type="protein"
          current={proteins}
          goal={proteinGoal}
          variant={variant}
        />
        <MacroCard
          type="carbs"
          current={carbs}
          goal={carbsGoal}
          variant={variant}
        />
        <MacroCard
          type="fats"
          current={fats}
          goal={fatsGoal}
          variant={variant}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeading: {
    ...fontStyles.headline2,
    marginBottom: scale(16),
    fontWeight: "700",
  },
  macrosContainer: {
    flexDirection: "row",
    marginBottom: scale(28),
    gap: scale(10),
  },
});

export default MealMacrosSection;
