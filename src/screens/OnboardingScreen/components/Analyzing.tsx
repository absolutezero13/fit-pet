import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
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

const AnalyzingScreen = ({ focused }: { focused: boolean }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [displayProgress, setDisplayProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isUpdateComplete, setIsUpdateComplete] = useState(false);

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateUserCalled = useRef(false);
  const hasNavigated = useRef(false);
  const isMountedRef = useRef(true);
  const ringScale = useSharedValue(1);
  const haloScale = useSharedValue(0.96);
  const haloOpacity = useSharedValue(0.16);
  const badgeLift = useSharedValue(0);
  const badgeScale = useSharedValue(1);
  const badgeRotation = useSharedValue(0);
  const phaseOpacity = useSharedValue(1);
  const phaseScale = useSharedValue(1);
  const phaseTranslateY = useSharedValue(0);

  const phases = useMemo(
    () => [
      {
        label: t("analyzing"),
        icon: "magnifying-glass" as const,
        gradient: [
          colors["color-info-100"],
          colors["color-info-200"],
          colors["color-info-300"],
        ] as [string, string, string],
      },
      {
        label: t("calculating"),
        icon: "calculator" as const,
        gradient: [
          colors["color-success-100"],
          colors["color-success-200"],
          colors["color-success-300"],
        ] as [string, string, string],
      },
      {
        label: t("optimizing"),
        icon: "bullseye" as const,
        gradient: [
          colors["color-warning-100"],
          colors["color-warning-200"],
          colors["color-warning-300"],
        ] as [string, string, string],
      },
    ],
    [colors, t],
  );

  const ringSize = Math.min(SCREEN_WIDTH - scale(48), scale(320));
  const strokeWidth = scale(16);
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const innerSize = ringSize - strokeWidth * 2 - scale(18);
  const currentPhase = phases[currentPhaseIndex] ?? phases[0];

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const stopAmbientAnimations = () => {
    cancelAnimation(ringScale);
    cancelAnimation(haloScale);
    cancelAnimation(haloOpacity);
    cancelAnimation(badgeLift);
    cancelAnimation(badgeScale);
    cancelAnimation(badgeRotation);
    cancelAnimation(phaseOpacity);
    cancelAnimation(phaseScale);
    cancelAnimation(phaseTranslateY);

    ringScale.value = 1;
    haloScale.value = 0.96;
    haloOpacity.value = 0.16;
    badgeLift.value = 0;
    badgeScale.value = 1;
    badgeRotation.value = 0;
    phaseOpacity.value = 1;
    phaseScale.value = 1;
    phaseTranslateY.value = 0;
  };

  const startAmbientAnimations = () => {
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.018, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );

    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.97, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );

    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.28, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.14, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );

    badgeLift.value = withRepeat(
      withSequence(
        withTiming(-scale(6), {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );

    badgeScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );

    badgeRotation.value = withRepeat(
      withSequence(
        withTiming(4, {
          duration: 900,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-4, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 900,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  };

  const animatePhaseChange = () => {
    phaseOpacity.value = 0.55;
    phaseScale.value = 0.94;
    phaseTranslateY.value = scale(10);

    phaseOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    phaseScale.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    phaseTranslateY.value = withTiming(0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
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
      console.log("user", useOnboardingStore.getState());

      const prompt = promptBuilder.createMacroGoalsPrompt(
        useOnboardingStore.getState(),
      );
      console.log("Prompt: ", prompt);
      const geminiRes = await createGeminiCompletion(prompt, "macroGoals");

      console.log("Gemini response raw: ", geminiRes);

      console.log(
        "Gemini response: ",
        geminiRes.response.candidates[0].content.parts,
      );

      console.log(
        "Parsed macro goals: ",
        JSON.parse(geminiRes.response.candidates[0].content.parts[0].text),
      );

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

    macroGoals.proteins = Math.round(proteinPercentage);
    macroGoals.carbs = Math.round(carbsPercentage);
    macroGoals.fats = Math.round(fatsPercentage);
    const calculatedGoals: MacroGoals = {
      proteins: Math.round(proteinPercentage),
      carbs: Math.round(carbsPercentage),
      fats: Math.round(fatsPercentage),
      calories,
    };
    console.log("last macro goals", calculatedGoals);

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
    if (!focused) {
      return;
    }

    animatePhaseChange();
  }, [currentPhaseIndex, focused]);

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
    transform: [{ scale: ringScale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  const phaseContentStyle = useAnimatedStyle(() => ({
    opacity: phaseOpacity.value,
    transform: [
      { translateY: phaseTranslateY.value },
      { scale: phaseScale.value },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: badgeLift.value },
      { scale: badgeScale.value },
      { rotate: `${badgeRotation.value}deg` },
    ],
  }));

  const strokeDashoffset = circumference * (1 - displayProgress / 100);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + scale(24),
          paddingBottom: insets.bottom + scale(24),
        },
      ]}
    >
      <View pointerEvents="none" style={styles.gradientBackground}>
        <Animated.View
          key={`gradient-${currentPhaseIndex}`}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(400)}
          style={styles.gradientLayer}
        >
          <LinearGradient
            colors={currentPhase.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />
        </Animated.View>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.ringWrapper,
            ringWrapperStyle,
            {
              width: ringSize,
              height: ringSize,
            },
          ]}
        >
          <Animated.View style={[styles.ringGlow, haloStyle]} />
          <Svg
            width={ringSize}
            height={ringSize}
            style={styles.ringRotation}
          >
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="white"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          </Svg>

          <View
            style={[
              styles.innerCircle,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
          >
            <Animated.View style={[styles.phaseContent, phaseContentStyle]}>
              <Animated.View style={[styles.iconBadge, badgeStyle]}>
                <FontAwesome6
                  name={currentPhase.icon}
                  size={scale(26)}
                  color="white"
                />
              </Animated.View>
              <Text style={styles.progressValue}>{displayProgress}%</Text>
              <Text style={styles.phaseLabel}>{currentPhase.label}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  ringRotation: {
    transform: [{ rotate: "-90deg" }],
  },
  innerCircle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: scale(20),
  },
  phaseContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: scale(18),
  },
  progressValue: {
    ...fontStyles.headline1,
    fontSize: scale(50),
    lineHeight: scale(54),
    color: "white",
    fontWeight: "700",
  },
  phaseLabel: {
    ...fontStyles.body1Bold,
    color: "rgba(255, 255, 255, 0.92)",
    textAlign: "center",
    marginTop: scale(10),
  },
});

export default AnalyzingScreen;
