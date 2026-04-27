import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCrashlytics } from "@react-native-firebase/crashlytics";
import { storageService } from "../../../storage/AsyncStorageService";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale, SCREEN_WIDTH } from "../../../theme/utils";
import { analyticsService, AnalyticsEvent } from "../../../services/analytics";
import { createGeminiCompletion } from "../../../services/gptApi";
import userService from "../../../services/user";
import promptBuilder from "../../../utils/promptBuilder";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { MacroGoals } from "../../../zustand/useUserStore";

const DEFAULT_MACRO_GOALS: MacroGoals = {
  calories: 2000,
  proteins: 30,
  carbs: 40,
  fats: 30,
};

const TOTAL_DURATION = 7500;
const PHASE_COUNT = 3;
const PHASE_DURATION = TOTAL_DURATION / PHASE_COUNT;
const PROGRESS_INTERVAL = 33;

enum PhaseStatus {
  Pending = "pending",
  Active = "active",
  Done = "done",
}

type Phase = {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome6>["name"];
};

interface AnalyzingProps {
  focused: boolean;
}

const Analyzing: React.FC<AnalyzingProps> = ({ focused }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [displayProgress, setDisplayProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isUpdateComplete, setIsUpdateComplete] = useState(false);

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const updateUserCalled = useRef(false);
  const hasNavigated = useRef(false);
  const isMountedRef = useRef(true);

  const ringPulse = useSharedValue(1);
  const spinnerRotation = useSharedValue(0);
  const activeDot = useSharedValue(0);

  const phases = useMemo<Phase[]>(
    () => [
      { label: t("analyzing"), icon: "magnifying-glass" },
      { label: t("calculating"), icon: "calculator" },
      { label: t("optimizing"), icon: "bullseye" },
    ],
    [t],
  );

  const ringSize = Math.min(SCREEN_WIDTH - scale(96), scale(260));
  const strokeWidth = scale(14);
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const spinnerArcLength = circumference * 0.14;

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const stopAmbientAnimations = () => {
    cancelAnimation(ringPulse);
    cancelAnimation(spinnerRotation);
    cancelAnimation(activeDot);

    ringPulse.value = 1;
    spinnerRotation.value = 0;
    activeDot.value = 0;
  };

  const startAmbientAnimations = () => {
    ringPulse.value = withRepeat(
      withTiming(1.025, {
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    spinnerRotation.value = withRepeat(
      withTiming(360, {
        duration: 1600,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    activeDot.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  };

  const completeAnimation = () => {
    if (!isMountedRef.current) {
      return;
    }

    clearProgressInterval();
    setDisplayProgress(100);
    setCurrentPhaseIndex(PHASE_COUNT - 1);
    setIsAnimationComplete(true);
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearProgressInterval();
      stopAmbientAnimations();
    };
  }, []);

  const updateUser = async () => {
    storageService.setItem("User", {
      ...useOnboardingStore.getState(),
    });

    let macroGoals: MacroGoals;
    try {
      const prompt = promptBuilder.createMacroGoalsPrompt(
        useOnboardingStore.getState(),
      );
      const geminiRes = await createGeminiCompletion(prompt, "macroGoals");
      macroGoals = JSON.parse(
        geminiRes.response.candidates[0].content.parts[0].text,
      );
    } catch (error) {
      console.log("Error generating macro goals:", error);
      macroGoals = DEFAULT_MACRO_GOALS;
      getCrashlytics().recordError(error as Error);
    }

    const isMacroGoalsValid =
      macroGoals &&
      typeof macroGoals.proteins === "number" &&
      typeof macroGoals.carbs === "number" &&
      typeof macroGoals.fats === "number";

    if (!isMacroGoalsValid) {
      macroGoals = DEFAULT_MACRO_GOALS;
    }

    const proteinCalories = macroGoals.proteins * 4;
    const carbsCalories = macroGoals.carbs * 4;
    const fatsCalories = macroGoals.fats * 9;
    const calories = proteinCalories + carbsCalories + fatsCalories;

    const proteinPercentage = (proteinCalories / calories) * 100;
    const carbsPercentage = (carbsCalories / calories) * 100;
    const fatsPercentage = (fatsCalories / calories) * 100;

    const calculatedGoals: MacroGoals = {
      proteins: Math.round(proteinPercentage),
      carbs: Math.round(carbsPercentage),
      fats: Math.round(fatsPercentage),
      calories,
    };

    await userService.createOrUpdateUser({
      macroGoals: calculatedGoals,
      onboarding: useOnboardingStore.getState(),
      onboardingCompleted: true,
    });

    const onboardingState = useOnboardingStore.getState();
    analyticsService.logEvent(AnalyticsEvent.OnboardingFinished, {
      goals: onboardingState.goals,
      gender: onboardingState.gender,
      yearOfBirth: onboardingState.yearOfBirth,
      weight: onboardingState.weight,
      height: onboardingState.height,
      dietTypes: onboardingState.dietTypes,
    });

    if (isMountedRef.current) {
      setIsUpdateComplete(true);
    }
  };

  useEffect(() => {
    if (!focused) {
      return;
    }

    hasNavigated.current = false;
    updateUserCalled.current = false;
    setDisplayProgress(0);
    setCurrentPhaseIndex(0);
    setIsAnimationComplete(false);
    setIsUpdateComplete(false);

    clearProgressInterval();
    stopAmbientAnimations();
    startAmbientAnimations();

    const startedAt = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Math.min(Date.now() - startedAt, TOTAL_DURATION);
      const nextProgress = Math.round((elapsed / TOTAL_DURATION) * 100);
      const nextPhaseIndex = Math.min(
        Math.floor(elapsed / PHASE_DURATION),
        PHASE_COUNT - 1,
      );

      setDisplayProgress((prev) =>
        prev === nextProgress ? prev : nextProgress,
      );
      setCurrentPhaseIndex((prev) =>
        prev === nextPhaseIndex ? prev : nextPhaseIndex,
      );

      if (elapsed >= TOTAL_DURATION) {
        completeAnimation();
      }
    }, PROGRESS_INTERVAL);

    if (!updateUserCalled.current) {
      updateUserCalled.current = true;
      void updateUser();
    }

    return () => {
      clearProgressInterval();
      stopAmbientAnimations();
    };
  }, [focused]);

  useEffect(() => {
    if (!focused || !isAnimationComplete || !isUpdateComplete) {
      return;
    }

    if (hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;
    navigation.reset({
      index: 0,
      routes: [{ name: "HomeTabs" }],
    });
  }, [focused, isAnimationComplete, isUpdateComplete, navigation]);

  const ringWrapperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringPulse.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  const activeDotStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + activeDot.value * 0.7,
    transform: [{ scale: 0.85 + activeDot.value * 0.3 }],
  }));

  const strokeDashoffset = circumference * (1 - displayProgress / 100);

  const getPhaseStatus = (index: number): PhaseStatus => {
    if (isAnimationComplete) {
      return PhaseStatus.Done;
    }
    if (index < currentPhaseIndex) {
      return PhaseStatus.Done;
    }
    if (index === currentPhaseIndex) {
      return PhaseStatus.Active;
    }
    return PhaseStatus.Pending;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + scale(24),
          paddingBottom: insets.bottom + scale(24),
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[fontStyles.headline2, { color: colors.text }]}>
          {t("carouselMessage3")}
        </Text>
      </View>

      <View style={styles.ringSection}>
        <Animated.View
          style={[
            styles.ringWrapper,
            ringWrapperStyle,
            { width: ringSize, height: ringSize },
          ]}
        >
          <Svg
            width={ringSize}
            height={ringSize}
            style={styles.rotatedSvg}
          >
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={colors.accent}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          </Svg>

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.spinnerWrapper,
              spinnerStyle,
            ]}
          >
            <Svg
              width={ringSize}
              height={ringSize}
              style={styles.rotatedSvg}
            >
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={colors.accent}
                strokeWidth={strokeWidth}
                strokeOpacity={0.35}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${spinnerArcLength} ${circumference}`}
              />
            </Svg>
          </Animated.View>

          <View style={styles.ringCenter}>
            <Text
              style={[
                fontStyles.headline1,
                styles.percent,
                { color: colors.text },
              ]}
            >
              {displayProgress}
              <Text
                style={[
                  fontStyles.headline3,
                  { color: colors.textSecondary },
                ]}
              >
                %
              </Text>
            </Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.checklist}>
        {phases.map((phase, index) => {
          const status = getPhaseStatus(index);
          const isDone = status === PhaseStatus.Done;
          const isActive = status === PhaseStatus.Active;

          const iconColor = isDone
            ? colors.accent
            : isActive
              ? colors.text
              : colors.textTertiary;
          const labelColor = isDone || isActive
            ? colors.text
            : colors.textTertiary;

          return (
            <View key={phase.label} style={styles.checklistRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    borderColor: isDone
                      ? colors.accent
                      : isActive
                        ? colors.text
                        : colors.border,
                    backgroundColor: isDone ? colors.accentSoft : "transparent",
                  },
                ]}
              >
                {isDone ? (
                  <FontAwesome6
                    name="check"
                    size={scale(12)}
                    color={colors.accent}
                  />
                ) : isActive ? (
                  <Animated.View
                    style={[
                      styles.activeDot,
                      activeDotStyle,
                      { backgroundColor: colors.text },
                    ]}
                  />
                ) : (
                  <FontAwesome6
                    name={phase.icon}
                    size={scale(11)}
                    color={colors.textTertiary}
                  />
                )}
              </View>
              <Text
                style={[
                  isActive ? fontStyles.body1Bold : fontStyles.body1,
                  styles.checklistLabel,
                  { color: labelColor },
                ]}
              >
                {phase.label}
                {isActive ? "…" : ""}
              </Text>
              {isDone && !isActive ? (
                <FontAwesome6
                  name={phase.icon}
                  size={scale(13)}
                  color={iconColor}
                  style={styles.trailingIcon}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  header: {
    alignItems: "center",
    marginTop: scale(8),
  },
  ringSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  rotatedSvg: {
    transform: [{ rotate: "-90deg" }],
  },
  spinnerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    fontSize: scale(52),
    lineHeight: scale(56),
    fontWeight: "700",
  },
  checklist: {
    gap: scale(14),
    marginBottom: scale(16),
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(14),
  },
  activeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  checklistLabel: {
    flex: 1,
  },
  trailingIcon: {
    marginLeft: scale(8),
  },
});

export default Analyzing;
