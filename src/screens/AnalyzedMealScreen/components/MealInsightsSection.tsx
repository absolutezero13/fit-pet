import React, { FC } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";

type Props = {
  insights?: string[] | null;
};

const MealInsightsSection: FC<Props> = ({ insights }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!insights || insights.length === 0) return null;

  return (
    <>
      <Text style={[styles.sectionHeading, { color: colors.text }]}>
        {t("insights")}
      </Text>
      <View style={[styles.insightsList, { backgroundColor: colors.surface }]}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View
              style={[
                styles.insightIconContainer,
                { backgroundColor: colors["color-warning-100"] },
              ]}
            >
              <MaterialCommunityIcons
                name="lightbulb"
                size={scale(20)}
                color={colors["color-warning-600"]}
              />
            </View>
            <Text style={[styles.insightText, { color: colors.text }]}>
              {insight}
            </Text>
          </View>
        ))}
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
  insightsList: {
    borderRadius: scale(20),
    padding: scale(18),
    marginBottom: scale(28),
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(16),
  },
  insightIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body1,
    flex: 1,
    lineHeight: scale(22),
  },
});

export default MealInsightsSection;
