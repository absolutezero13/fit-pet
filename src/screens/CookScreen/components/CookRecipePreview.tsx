import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from "@callstack/liquid-glass";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/AppButton";
import { CookRecipe } from "../../../services/apiTypes";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

interface CookRecipePreviewProps {
  recipe: CookRecipe;
  ctaLabel: string;
  onStartCooking: () => void;
}

const CookRecipePreview = ({
  recipe,
  ctaLabel,
  onStartCooking,
}: CookRecipePreviewProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const previewIngredients = recipe.ingredients.slice(0, 5);
  const previewSteps = recipe.steps.slice(0, 3);
  const hiddenIngredientCount = Math.max(
    recipe.ingredients.length - previewIngredients.length,
    0,
  );
  const hiddenStepCount = Math.max(
    recipe.steps.length - previewSteps.length,
    0,
  );
  const cardSurfaceStyle = {
    backgroundColor: isLiquidGlassSupported ? undefined : colors.surface,
    borderColor: colors.border,
    borderWidth: isLiquidGlassSupported ? 0 : 1,
  } as const;

  return (
    <View style={styles.container}>
      <LiquidGlassView
        effect="clear"
        interactive
        style={[styles.heroCard, cardSurfaceStyle]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {recipe.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {recipe.subtitle}
          </Text>
          <Text style={[styles.summary, { color: colors.textSecondary }]}>
            {recipe.summary}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.metaCard,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("cookMetaTime")}
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {recipe.prepMinutes + recipe.cookMinutes} min
            </Text>
          </View>
          <View
            style={[
              styles.metaCard,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("cookMetaServings")}
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {recipe.servings}
            </Text>
          </View>
          <View
            style={[
              styles.metaCard,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("cookMetaLevel")}
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {getDifficultyLabel(t, recipe.difficulty)}
            </Text>
          </View>
        </View>
      </LiquidGlassView>

      <AppButton
        title={ctaLabel}
        onPress={onStartCooking}
        backgroundColor={colors["color-success-400"]}
      />

      <LiquidGlassView
        effect="clear"
        interactive
        style={[styles.sectionCard, cardSurfaceStyle]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("cookIngredientsTitle")}
          </Text>
          <View
            style={[
              styles.countPill,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {recipe.ingredients.length}
            </Text>
          </View>
        </View>
        <View style={styles.sectionBody}>
          {previewIngredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.rowItem}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle-outline"
                size={scale(16)}
                color={colors["color-success-400"]}
              />
              <Text style={[styles.rowText, { color: colors.textSecondary }]}>
                {ingredient.amount ? `${ingredient.amount} - ` : ""}
                {ingredient.item}
              </Text>
            </View>
          ))}
        </View>
        {hiddenIngredientCount > 0 ? (
          <Text style={[styles.moreItemsText, { color: colors.textSecondary }]}>
            {t("cookPreviewMoreItems", { count: hiddenIngredientCount })}
          </Text>
        ) : null}
      </LiquidGlassView>

      <LiquidGlassView
        effect="clear"
        interactive
        style={[styles.sectionCard, cardSurfaceStyle]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("cookStepsTitle")}
          </Text>
          <View
            style={[
              styles.countPill,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {recipe.steps.length}
            </Text>
          </View>
        </View>
        <View style={styles.sectionBody}>
          {previewSteps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: colors["color-success-50"] },
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    { color: colors["color-success-500"] },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <View style={styles.stepTextWrap}>
                <View style={styles.stepHeaderRow}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {step.title}
                  </Text>
                  {step.timerSeconds ? (
                    <View
                      style={[
                        styles.timerPill,
                        { backgroundColor: colors.backgroundSecondary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timerText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t("cookTimerLabel")}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  numberOfLines={2}
                  style={[styles.rowText, { color: colors.textSecondary }]}
                >
                  {step.instruction}
                </Text>
              </View>
            </View>
          ))}
        </View>
        {hiddenStepCount > 0 ? (
          <Text style={[styles.moreItemsText, { color: colors.textSecondary }]}>
            {t("cookPreviewMoreItems", { count: hiddenStepCount })}
          </Text>
        ) : null}
      </LiquidGlassView>
    </View>
  );
};

const getDifficultyLabel = (t: (key: string) => string, difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return t("cookDifficultyEasy");
    case "hard":
      return t("cookDifficultyHard");
    default:
      return t("cookDifficultyMedium");
  }
};

const styles = StyleSheet.create({
  container: {
    gap: scale(18),
  },
  heroCard: {
    borderRadius: scale(28),
    padding: scale(20),
    gap: scale(18),
  },
  header: {
    gap: scale(6),
  },
  title: {
    ...fontStyles.headline1,
  },
  subtitle: {
    ...fontStyles.headline4,
  },
  summary: {
    ...fontStyles.body1,
  },
  metaRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  metaCard: {
    flex: 1,
    borderRadius: scale(18),
    padding: scale(12),
    gap: scale(2),
  },
  metaLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  metaValue: {
    ...fontStyles.headline4,
    textTransform: "capitalize",
  },
  sectionCard: {
    borderRadius: scale(24),
    padding: scale(18),
    gap: scale(12),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  countPill: {
    minWidth: scale(36),
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    alignItems: "center",
  },
  countText: {
    ...fontStyles.caption,
  },
  section: {
    gap: scale(10),
  },
  sectionTitle: {
    ...fontStyles.headline3,
  },
  sectionBody: {
    gap: scale(12),
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  rowText: {
    ...fontStyles.body1,
    flex: 1,
  },
  stepItem: {
    flexDirection: "row",
    gap: scale(12),
    alignItems: "flex-start",
  },
  stepBadge: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(2),
  },
  stepNumber: {
    ...fontStyles.body1Bold,
  },
  stepTextWrap: {
    flex: 1,
    gap: scale(4),
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  stepTitle: {
    ...fontStyles.headline4,
    flex: 1,
  },
  timerPill: {
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
  },
  timerText: {
    ...fontStyles.caption,
  },
  moreItemsText: {
    ...fontStyles.body2,
  },
});

export default CookRecipePreview;
