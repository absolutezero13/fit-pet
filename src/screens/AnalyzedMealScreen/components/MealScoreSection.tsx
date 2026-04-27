import React, { FC } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import usePreferencesStore from "../../../zustand/usePreferencesStore";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import getScoreColor from "../../../utils/getScoreColor";
import { getScoreTranslationKey } from "../../../utils/scoreExplanations";

type Props = {
  score: number;
};

const MealScoreSection: FC<Props> = ({ score }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const aiTone = usePreferencesStore((state) => state.aiTone);
  const color = getScoreColor(score, colors);

  return (
    <View style={[styles.scoreSection, { backgroundColor: colors.surface }]}>
      <View style={[styles.scoreContainer, { backgroundColor: color }]}>
        <Text style={[styles.scoreValue, { color: colors.textInverse }]}>
          {score}
        </Text>
      </View>
      <View style={styles.scoreTextContainer}>
        <Text style={[styles.scoreHeading, { color: colors.textSecondary }]}>
          {t("nutritionScore")}
        </Text>
        <Text style={[styles.scoreLabel, { color }]}>
          {t(getScoreTranslationKey(score, aiTone))}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(28),
    padding: scale(20),
    borderRadius: scale(20),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginRight: scale(18),
  },
  scoreValue: {
    ...fontStyles.headline1,
    fontSize: scale(32),
    fontWeight: "bold",
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreHeading: {
    ...fontStyles.body1,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: scale(6),
    fontWeight: "600",
  },
  scoreLabel: {
    ...fontStyles.headline2,
    fontWeight: "700",
  },
});

export default MealScoreSection;
