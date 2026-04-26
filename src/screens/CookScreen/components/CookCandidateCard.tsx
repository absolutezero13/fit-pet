import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import Animated, {
  cancelAnimation,
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { CookRecipe } from "../../../services/apiTypes";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

interface CookCandidateCardProps {
  recipe: CookRecipe;
  index?: number;
  isRefreshing: boolean;
  activeVariation: string | null;
  onStartCooking: () => void | Promise<void>;
  onPressVariation: (variation: string) => void | Promise<void>;
}

const CookCandidateCard = ({
  recipe,
  index = 0,
  isRefreshing,
  activeVariation,
  onStartCooking,
  onPressVariation,
}: CookCandidateCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accentColor =
    index % 2 === 0 ? colors["color-success-400"] : colors["color-info-400"];
  const accentColorSoft = `${accentColor}18`;
  const accentIcon = index % 2 === 0 ? "chef-hat" : "silverware-fork-knife";
  const shimmerProgress = useSharedValue(0);
  const shimmerStartX = -scale(140);
  const shimmerTravelX = scale(580);
  const metaItems = [
    {
      key: "calories",
      label: t("calories"),
      value: formatNutritionValue(recipe.nutrition?.calories, " kcal"),
    },
    {
      key: "protein",
      label: t("proteins"),
      value: formatNutritionValue(recipe.nutrition?.protein, "g"),
    },
    {
      key: "prep",
      label: t("cookMetaPrep"),
      value: `${recipe.prepMinutes} min`,
    },
    {
      key: "difficulty",
      label: t("cookMetaLevel"),
      value: getDifficultyLabel(t, recipe.difficulty),
    },
  ];

  useEffect(() => {
    if (isRefreshing) {
      shimmerProgress.value = 0;
      shimmerProgress.value = withRepeat(
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        false,
      );

      return () => {
        cancelAnimation(shimmerProgress);
      };
    }

    cancelAnimation(shimmerProgress);
    shimmerProgress.value = 0;

    return undefined;
  }, [isRefreshing, shimmerProgress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shimmerStartX + shimmerProgress.value * shimmerTravelX },
      { rotate: "20deg" },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(320)}
      style={styles.wrapper}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={[styles.cardContent, isRefreshing ? styles.cardContentRefreshing : null]}>
          <LinearGradient
            colors={[accentColorSoft, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBlock}
          >
            <View style={[styles.iconWrap, { backgroundColor: accentColorSoft }]}> 
              <MaterialCommunityIcons
                name={accentIcon}
                size={scale(18)}
                color={accentColor}
              />
            </View>

            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
              <Text style={[styles.summary, { color: colors.textSecondary }]}> 
                {recipe.summary}
              </Text>
            </View>
          </LinearGradient>

          <Pressable
            disabled={isRefreshing}
            onPress={onStartCooking}
            style={[
              styles.cookButton,
              {
                backgroundColor: accentColor,
                opacity: isRefreshing ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.cookButtonLabel, { color: colors.textInverse }]}>
              {t("cookStartCooking")}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={scale(15)}
              color={colors.textInverse}
            />
          </Pressable>

          <View style={styles.metaGrid}>
            {metaItems.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.metaCard,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.variationBlock,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <View style={styles.variationHeader}>
              <View
                style={[
                  styles.variationHeaderIcon,
                  { backgroundColor: `${accentColor}18` },
                ]}
              >
                <MaterialCommunityIcons
                  name="creation"
                  size={scale(16)}
                  color={accentColor}
                />
              </View>
              <View style={styles.variationHeaderCopy}>
                <Text style={[styles.variationTitle, { color: colors.text }]}>
                  {t("cookVariationTitle")}
                </Text>
                <Text
                  style={[
                    styles.variationSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("cookVariationSubtitle")}
                </Text>
              </View>
            </View>

            <View style={styles.variationList}>
              {recipe.variations.map((variation) => {
                const isActiveVariation =
                  isRefreshing && activeVariation === variation;
                const variationStatusLabel = isActiveVariation
                  ? t("cookVariationRefreshing")
                  : null;

                return (
                  <Pressable
                    key={variation}
                    disabled={isRefreshing}
                    onPress={() => onPressVariation(variation)}
                    style={[
                      styles.variationChip,
                      {
                        backgroundColor: isActiveVariation
                          ? accentColor
                          : colors.surface,
                        borderColor: isActiveVariation ? accentColor : colors.border,
                        opacity: isRefreshing && !isActiveVariation ? 0.5 : 1,
                      },
                    ]}
                  >
                    <View style={styles.variationChipMain}>
                      <View
                        style={[
                          styles.variationChipIcon,
                          {
                            backgroundColor: isActiveVariation
                              ? `${colors.textInverse}22`
                              : `${accentColor}18`,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            isActiveVariation ? "progress-clock" : "auto-fix"
                          }
                          size={scale(16)}
                          color={isActiveVariation ? colors.textInverse : accentColor}
                        />
                      </View>
                      <View style={styles.variationChipCopy}>
                        {variationStatusLabel ? (
                          <Text
                            style={[
                              styles.variationChipHint,
                              {
                                color: `${colors.textInverse}CC`,
                              },
                            ]}
                          >
                            {variationStatusLabel}
                          </Text>
                        ) : null}
                        <Text
                          style={[
                            styles.variationChipText,
                            {
                              color: isActiveVariation
                                ? colors.textInverse
                                : colors.text,
                            },
                          ]}
                        >
                          {variation}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={scale(18)}
                      color={
                        isActiveVariation ? colors.textInverse : colors.textSecondary
                      }
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

        </View>

        {isRefreshing ? (
          <View
            pointerEvents="none"
            style={styles.shimmerOverlay}
          >
            <Animated.View style={[styles.shimmerBand, shimmerStyle]}>
              <LinearGradient
                colors={["transparent", `${colors.white}28`, `${colors.white}50`, `${colors.white}28`, "transparent"]}
                locations={[0, 0.3, 0.5, 0.7, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

const formatNutritionValue = (value?: number, suffix = "") => {
  if (value == null) {
    return "--";
  }

  return `${Math.round(value)}${suffix}`;
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
  wrapper: {
    width: "100%",
  },
  card: {
    borderWidth: 1,
    borderRadius: scale(28),
    padding: scale(18),
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.08,
    shadowRadius: scale(16),
    elevation: 4,
    overflow: "hidden",
  },
  cardContent: {
    gap: scale(14),
  },
  cardContentRefreshing: {
    opacity: 0.72,
  },
  heroBlock: {
    borderRadius: scale(22),
    padding: scale(16),
    gap: scale(14),
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  titleWrap: {
    gap: scale(6),
  },
  title: {
    ...fontStyles.headline2,
  },
  summary: {
    ...fontStyles.body1,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
  },
  metaCard: {
    width: "48%",
    borderRadius: scale(18),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    gap: scale(2),
  },
  metaLabel: {
    ...fontStyles.caption,
  },
  metaValue: {
    ...fontStyles.body1Bold,
  },
  variationBlock: {
    borderRadius: scale(20),
    padding: scale(14),
    gap: scale(12),
  },
  variationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  variationHeaderIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  variationHeaderCopy: {
    flex: 1,
    gap: scale(2),
  },
  variationTitle: {
    ...fontStyles.body1Bold,
  },
  variationSubtitle: {
    ...fontStyles.caption,
  },
  variationList: {
    gap: scale(10),
  },
  variationChip: {
    minHeight: scale(62),
    borderRadius: scale(18),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  variationChipMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  variationChipIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  variationChipCopy: {
    flex: 1,
    gap: scale(2),
  },
  variationChipHint: {
    ...fontStyles.caption,
  },
  variationChipText: {
    ...fontStyles.body1Bold,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    overflow: "hidden",
  },
  shimmerBand: {
    width: scale(120),
    height: "150%",
  },
  shimmerGradient: {
    flex: 1,
  },
  cookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    alignSelf: "flex-start",
    minHeight: scale(36),
  },
  cookButtonLabel: {
    ...fontStyles.body1Bold,
  },
});

export default CookCandidateCard;
