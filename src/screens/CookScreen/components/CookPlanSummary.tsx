import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeInUp } from "react-native-reanimated";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

interface CookPlanItem {
  label: string;
  value: string;
}

interface CookPlanSummaryProps {
  items: CookPlanItem[];
}

const CookPlanSummary = ({ items }: CookPlanSummaryProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("cookPlanSummaryTitle")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {items.map((item) => (
          <View
            key={item.label}
            style={[styles.chip, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[styles.chipValue, { color: colors.text }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: scale(22),
    padding: scale(16),
    gap: scale(12),
  },
  title: {
    ...fontStyles.headline4,
  },
  chips: {
    flexDirection: "row",
    gap: scale(8),
  },
  chip: {
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    gap: scale(2),
  },
  chipLabel: {
    ...fontStyles.caption,
  },
  chipValue: {
    ...fontStyles.body1Bold,
  },
});

export default CookPlanSummary;
