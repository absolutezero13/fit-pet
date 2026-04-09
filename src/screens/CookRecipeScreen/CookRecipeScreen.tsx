import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  Easing,
  LinearTransition,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
  SlideOutUp,
  ZoomIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import AppButton from "../../components/AppButton";
import { CookRecipe } from "../../services/apiTypes";
import { fontStyles } from "../../theme/fontStyles";
import { useTheme } from "../../theme/ThemeContext";
import { scale } from "../../theme/utils";
import CookRecipePreview from "../CookScreen/components/CookRecipePreview";
import CookStepTimer from "../CookScreen/components/CookStepTimer";
import AnalyzingMealOverlay from "../../components/AnalyzingMealOverlay";
import { createCookLoggedMeal } from "../../services/gptApi";
import { createMeal } from "../../services/mealAnalysis";
import useMealsStore from "../../zustand/useMealsStore";
import { getLocalDateKey } from "../../utils/dateUtils";
import { analyticsService, AnalyticsEvent } from "../../services/analytics";

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
  const [finishingStepId, setFinishingStepId] = useState<string | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<
    "forward" | "backward"
  >("forward");
  const [isLoggingMeal, setIsLoggingMeal] = useState(false);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseProgress = useSharedValue(0);

  const currentStep = recipe.steps[activeStepIndex];
  const isLastStep = activeStepIndex === recipe.steps.length - 1;
  const isFinishingCurrentStep = finishingStepId === currentStep.id;

  const completedCountLabel = useMemo(
    () => t("cookCompletedCount", { count: completedStepIds.length }),
    [completedStepIds.length, t],
  );

  const resetCookFlow = () => {
    setFinishingStepId(null);
    setTransitionDirection("forward");
    setActiveStepIndex(0);
    setCompletedStepIds([]);
    setMode("preview");
  };

  useEffect(() => {
    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: 850,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, [pulseProgress]);

  const circlePulseStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      pulseProgress.value,
      [0, 1],
      [colors.backgroundSecondary, colors.surface],
    ),
  }));

  const handlePreviousStep = () => {
    if (finishingStepId) {
      return;
    }

    setTransitionDirection("backward");
    setActiveStepIndex((current) => Math.max(0, current - 1));
  };

  const handleAdvanceStep = () => {
    if (finishingStepId) {
      return;
    }

    if (!completedStepIds.includes(currentStep.id)) {
      setCompletedStepIds((current) => [...current, currentStep.id]);
    }

    setFinishingStepId(currentStep.id);
    setTransitionDirection("forward");

    advanceTimeoutRef.current = setTimeout(() => {
      setFinishingStepId(null);

      if (isLastStep) {
        Alert.alert(t("cookLogMealTitle"), t("cookLogMealBody"), [
          {
            text: t("cookLogMealSkip"),
            style: "cancel",
            onPress: resetCookFlow,
          },
          {
            text: t("cookLogMealConfirm"),
            onPress: () => {
              void handleLogCookedMeal();
            },
          },
        ]);
        return;
      }

      setActiveStepIndex((current) => current + 1);
    }, 320);
  };

  const handleLogCookedMeal = async () => {
    setIsLoggingMeal(true);

    try {
      const meal = await createCookLoggedMeal(recipe);

      if (meal.errorMessage) {
        analyticsService.logEvent(AnalyticsEvent.MealLogError);
        Alert.alert(
          t("globalError"),
          meal.errorMessage ?? t("globalErrorMessage"),
        );
        resetCookFlow();
        return;
      }

      meal.date = getLocalDateKey(new Date());
      meal.image = null;

      const createdMeal = await createMeal(meal);

      if (!createdMeal?.id) {
        analyticsService.logEvent(AnalyticsEvent.MealLogError);
        Alert.alert(t("globalError"), t("globalErrorMessage"));
        resetCookFlow();
        return;
      }

      useMealsStore.setState((state) => ({
        loggedMeals: [...state.loggedMeals, createdMeal],
      }));

      analyticsService.logEvent(AnalyticsEvent.MealLogged, {
        type: "text",
        description: createdMeal.description,
      });

      resetCookFlow();
      navigation.navigate("AnalyzedMeal", {
        mealId: createdMeal.id,
      });
    } catch (error) {
      console.error("Error logging cooked meal:", error);
      analyticsService.logEvent(AnalyticsEvent.MealLogError);
      Alert.alert(t("globalError"), t("globalErrorMessage"));
      resetCookFlow();
    } finally {
      setIsLoggingMeal(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <AnalyzingMealOverlay
        visible={isLoggingMeal}
        label={t("cookLoggingMeal")}
      />

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
            <Animated.View
              entering={FadeInUp.duration(240)}
              style={styles.cookContent}
            >
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
                            backgroundColor:
                              isDone || isActive
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

                <Text
                  style={[
                    styles.cardLabel,
                    styles.progressLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("cookStepProgress", {
                    current: activeStepIndex + 1,
                    total: recipe.steps.length,
                  })}
                </Text>
              </View>

              <View style={styles.bottomContentBlock}>
                <Animated.View
                  key={`body-${currentStep.id}`}
                  entering={
                    transitionDirection === "forward"
                      ? SlideInDown.duration(260)
                      : SlideInUp.duration(260)
                  }
                  exiting={
                    transitionDirection === "forward"
                      ? SlideOutUp.duration(180)
                      : SlideOutDown.duration(180)
                  }
                  layout={LinearTransition}
                  style={styles.activeStepBlock}
                >
                  <Animated.View
                    style={[
                      styles.instructionCircleWrap,
                      circlePulseStyle,
                      isFinishingCurrentStep
                        ? { backgroundColor: colors["color-success-100"] }
                        : null,
                    ]}
                  >
                    <LiquidGlassView
                      effect="clear"
                      interactive
                      style={[
                        styles.instructionCircle,
                        {
                          backgroundColor: isLiquidGlassSupported
                            ? undefined
                            : "transparent",
                          borderColor: isFinishingCurrentStep
                            ? colors["color-success-400"]
                            : colors.border,
                          borderWidth: isLiquidGlassSupported
                            ? isFinishingCurrentStep
                              ? 2
                              : 0
                            : 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.heroBody,
                          styles.instructionText,
                          { color: colors.text },
                        ]}
                      >
                        {currentStep.instruction}
                      </Text>

                      {isFinishingCurrentStep ? (
                        <Animated.View
                          entering={ZoomIn.duration(160)}
                          style={[
                            styles.completedBadge,
                            { backgroundColor: colors["color-success-400"] },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="check"
                            size={scale(36)}
                            color={colors.textInverse}
                          />
                        </Animated.View>
                      ) : null}
                    </LiquidGlassView>
                  </Animated.View>

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
                        style={[
                          styles.tipLabel,
                          { color: colors.textSecondary },
                        ]}
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
                </Animated.View>

                <Text
                  style={[
                    styles.completedText,
                    { color: colors.textSecondary },
                  ]}
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
                  disabled={activeStepIndex === 0 || !!finishingStepId}
                  onPress={handlePreviousStep}
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity:
                        activeStepIndex === 0 || finishingStepId ? 0.5 : 1,
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
                    onPress={handleAdvanceStep}
                    backgroundColor={colors["color-success-400"]}
                    disabled={!!finishingStepId}
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
    alignItems: "center",
  },
  cardLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  progressLabel: {
    textAlign: "center",
  },
  heroBody: {
    ...fontStyles.body1,
  },
  activeStepBlock: {
    alignItems: "center",
    width: "100%",
    gap: scale(16),
  },
  instructionCircleWrap: {
    width: scale(286),
    height: scale(286),
    borderRadius: scale(143),
    overflow: "hidden",
  },
  instructionCircle: {
    width: "100%",
    height: "100%",
    borderRadius: scale(143),
    borderWidth: 2,
    padding: scale(28),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  instructionText: {
    ...fontStyles.headline4,
    textAlign: "center",
    lineHeight: scale(28),
  },
  completedBadge: {
    position: "absolute",
    bottom: scale(20),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  tipBox: {
    borderRadius: scale(18),
    padding: scale(14),
    gap: scale(6),
    width: "100%",
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(24),
    paddingBottom: scale(14),
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
