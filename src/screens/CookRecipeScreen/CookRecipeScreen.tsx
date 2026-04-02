import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from "@callstack/liquid-glass";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeInUp,
  FadeOut,
  LinearTransition,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import AppButton from "../../components/AppButton";
import { CookRecipe } from "../../services/apiTypes";
import { fontStyles } from "../../theme/fontStyles";
import { useTheme } from "../../theme/ThemeContext";
import { scale } from "../../theme/utils";
import CookRecipePreview from "../CookScreen/components/CookRecipePreview";
import CookStepTimer from "../CookScreen/components/CookStepTimer";

type CookRecipeRouteParams = {
  recipe: CookRecipe;
};

const CookRecipeScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { recipe } = useRoute().params as CookRecipeRouteParams;
  const [mode, setMode] = useState<"preview" | "cook">("preview");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  const currentStep = recipe.steps[activeStepIndex];
  const isLastStep = activeStepIndex === recipe.steps.length - 1;

  const completedCountLabel = useMemo(
    () => t("cookCompletedCount", { count: completedStepIds.length }),
    [completedStepIds.length, t],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect="clear"
        style={[
          styles.header,
          {
            paddingTop: top,
            backgroundColor: isLiquidGlassSupported
              ? undefined
              : colors.backgroundSecondary,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={scale(28)}
              color={colors.text}
            />
          </Pressable>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.headerTitle, { color: colors.text }]}
          >
            {mode === "preview" ? recipe.title : t("cookModeLabel")}
          </Text>
          <View style={styles.headerButton} />
        </View>
      </LiquidGlassView>

      {mode === "preview" ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: top + scale(64) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(240)}>
            <CookRecipePreview
              recipe={recipe}
              ctaLabel={t("cookStartCooking")}
              onStartCooking={() => setMode("cook")}
            />
          </Animated.View>
        </ScrollView>
      ) : (
        <View
          style={[
            styles.cookModeScreen,
            { paddingTop: top + scale(76), paddingBottom: bottom + scale(12) },
          ]}
        >
          <View style={styles.cookModeContainer}>
            <Animated.View entering={FadeInUp.duration(240)} style={styles.cookContent}>
              <View style={styles.cookContentSpacer} />
              <View style={styles.topCluster}>
                <View style={styles.stepVisualizerRow}>
                  {recipe.steps.map((step, index) => {
                    const isActive = index === activeStepIndex;
                    const isDone = index < activeStepIndex;

                    return (
                      <View
                        key={step.id}
                        style={[
                          styles.stepVisualizerItem,
                          {
                            backgroundColor: isDone || isActive
                              ? colors["color-success-400"]
                              : colors.border,
                            opacity: isActive ? 1 : isDone ? 0.8 : 0.45,
                            flex: isActive ? 1.4 : 1,
                          },
                        ]}
                      />
                    );
                  })}
                </View>

                <LiquidGlassView
                  effect="clear"
                  interactive
                  style={[
                    styles.stepHeroCard,
                    {
                      backgroundColor: isLiquidGlassSupported
                        ? undefined
                        : colors.surface,
                      borderColor: colors.border,
                      borderWidth: isLiquidGlassSupported ? 0 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.cardLabel, { color: colors.textSecondary }]}> 
                    {t("cookStepProgress", {
                      current: activeStepIndex + 1,
                      total: recipe.steps.length,
                    })}
                  </Text>
                  <Text style={[styles.heroTitle, { color: colors.text }]}> 
                    {currentStep.title}
                  </Text>
                </LiquidGlassView>
              </View>

              <View style={styles.bottomContentBlock}>
                <Animated.View
                  key={`body-${currentStep.id}`}
                  entering={SlideInRight.duration(240)}
                  exiting={SlideOutLeft.duration(180)}
                  layout={LinearTransition}
                >
                  <LiquidGlassView
                    effect="clear"
                    interactive
                    style={[
                      styles.messageCard,
                      {
                        backgroundColor: isLiquidGlassSupported
                          ? undefined
                          : colors.surface,
                        borderColor: colors.border,
                        borderWidth: isLiquidGlassSupported ? 0 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.heroBody, { color: colors.text }]}> 
                      {currentStep.instruction}
                    </Text>
                    {currentStep.timerSeconds ? (
                      <CookStepTimer
                        key={currentStep.id}
                        initialSeconds={currentStep.timerSeconds}
                      />
                    ) : null}
                    {currentStep.tips?.length ? (
                      <View
                        style={[
                          styles.tipBox,
                          { backgroundColor: colors.backgroundSecondary },
                        ]}
                      >
                        <Text
                          style={[styles.tipLabel, { color: colors.textSecondary }]}
                        >
                          {t("cookTipsTitle")}
                        </Text>
                        {currentStep.tips.map((tip) => (
                          <Text
                            key={tip}
                            style={[styles.tipText, { color: colors.text }]}
                          >
                            - {tip}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </LiquidGlassView>
                </Animated.View>

                <Text
                  style={[styles.completedText, { color: colors.textSecondary }]}
                >
                  {completedCountLabel}
                </Text>
              </View>
            </Animated.View>

            <View
              style={[
                styles.bottomActions,
                {
                  backgroundColor: colors.background,
                },
              ]}
            >
              <View style={styles.navigationRow}>
                <Pressable
                  disabled={activeStepIndex === 0}
                  onPress={() =>
                    setActiveStepIndex((current) => Math.max(0, current - 1))
                  }
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: activeStepIndex === 0 ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.secondaryButtonText, { color: colors.text }]}
                  >
                    {t("cookPrevious")}
                  </Text>
                </Pressable>
                <View style={styles.flexButton}>
                  <AppButton
                    title={isLastStep ? t("cookFinish") : t("cookNextStep")}
                    onPress={() => {
                      if (!completedStepIds.includes(currentStep.id)) {
                        setCompletedStepIds((current) => [
                          ...current,
                          currentStep.id,
                        ]);
                      }

                      if (isLastStep) {
                        setMode("preview");
                        return;
                      }

                      setActiveStepIndex((current) => current + 1);
                    }}
                    backgroundColor={colors["color-success-400"]}
                    flex
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(14),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  headerButton: {
    width: scale(36),
    height: scale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...fontStyles.headline3,
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: scale(24),
    paddingBottom: scale(120),
  },
  cookModeScreen: {
    flex: 1,
  },
  cookModeContainer: {
    flex: 1,
  },
  cookContent: {
    flex: 1,
    paddingHorizontal: scale(24),
    gap: scale(18),
  },
  topCluster: {
    gap: scale(14),
  },
  stepVisualizerRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  stepVisualizerItem: {
    height: scale(6),
    borderRadius: scale(999),
  },
  cookContentSpacer: {
    flex: 0.55,
  },
  bottomContentBlock: {
    gap: scale(14),
  },
  sectionGap: {
    gap: scale(18),
  },
  copyBlock: {
    gap: scale(6),
  },
  stepHeroCard: {
    borderRadius: scale(24),
    padding: scale(18),
    gap: scale(6),
  },
  cardLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  heroTitle: {
    ...fontStyles.headline1,
  },
  heroBody: {
    ...fontStyles.body1,
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: scale(24),
    padding: scale(18),
    gap: scale(14),
  },
  tipBox: {
    borderRadius: scale(18),
    padding: scale(14),
    gap: scale(6),
  },
  tipLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  tipText: {
    ...fontStyles.body1,
  },
  navigationRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  bottomActions: {
    paddingHorizontal: scale(24),
    paddingTop: scale(14),
  },
  secondaryButton: {
    minHeight: scale(56),
    borderRadius: scale(32),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(18),
    borderWidth: 1,
  },
  secondaryButtonText: {
    ...fontStyles.headline4,
  },
  flexButton: {
    flex: 1,
  },
  completedText: {
    ...fontStyles.body2,
    textAlign: "center",
  },
});

export default CookRecipeScreen;
