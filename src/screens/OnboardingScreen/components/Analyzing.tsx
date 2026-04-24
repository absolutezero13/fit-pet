import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { storageService } from "../../../storage/AsyncStorageService";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale, SCREEN_WIDTH } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { MacroGoals } from "../../../zustand/useUserStore";
import { createGeminiCompletion } from "../../../services/gptApi";
import promptBuilder from "../../../utils/promptBuilder";
import userService from "../../../services/user";
import { getCrashlytics } from "@react-native-firebase/crashlytics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { analyticsService, AnalyticsEvent } from "../../../services/analytics";

const DEFAULT_MACRO_GOALS: MacroGoals = {
  calories: 2000,
  proteins: 30,
  carbs: 40,
  fats: 30,
};

// Carousel slide duration in milliseconds (2.5 seconds)
const SLIDE_DURATION = 2500;
const TOTAL_SLIDES = 3;


const AnalyzingScreen = ({ focused }: { focused: boolean }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const slideGradients: [string, string, string][] = [
    [colors["color-info-100"], colors["color-info-200"], colors["color-info-300"]],
    [colors["color-success-100"], colors["color-success-200"], colors["color-success-300"]],
    [colors["color-warning-100"], colors["color-warning-200"], colors["color-warning-300"]],
  ];
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateUserCalled = useRef(false);
  const insets = useSafeAreaInsets();
  // Get user data
  const onboardingState = useOnboardingStore.getState();
  const userAge =
    new Date().getFullYear() - (onboardingState.yearOfBirth ?? 1990);
  const userHeight = onboardingState.height ?? 170;
  const userWeight = onboardingState.weight ?? 70;

  // Carousel slide content with personalized messages (titles removed per feedback)
  const slides = [
    {
      message: t("carouselMessage1", { age: userAge }),
      gradient: slideGradients[0],
      icon: "magnifying-glass" as const,
      title: t("analyzing"),
    },
    {
      message: t("carouselMessage2", { height: userHeight }),
      gradient: slideGradients[1],
      icon: "dumbbell" as const,
      title: t("calculating"),
    },
    {
      message: t("carouselMessage4"),
      gradient: slideGradients[2],
      icon: "bolt" as const,
      title: t("optimizing"),
    },
  ];

  // Animation values
  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  // Animated dots for loading indicator
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  const updateUser = async () => {
    storageService.setItem("User", {
      ...useOnboardingStore.getState(),
    });

    let macroGoals: MacroGoals;
    try {
      console.log("user", useOnboardingStore.getState());

      const prompt = promptBuilder.createMacroGoalsPrompt(
        useOnboardingStore.getState()
      );
      console.log("Prompt: ", prompt);
      const geminiRes = await createGeminiCompletion(prompt, "macroGoals");

      console.log("Gemini response raw: ", geminiRes);

      console.log(
        "Gemini response: ",
        geminiRes.response.candidates[0].content.parts
      );

      console.log(
        "Parsed macro goals: ",
        JSON.parse(geminiRes.response.candidates[0].content.parts[0].text)
      );

      macroGoals = JSON.parse(
        geminiRes.response.candidates[0].content.parts[0].text
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
      calories: calories,
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

    navigation.reset({
      index: 0,
      routes: [{ name: "HomeTabs" }],
    });
  };

  const advanceSlide = () => {
    setCurrentSlide((prev) => {
      const nextSlide = prev + 1;
      if (nextSlide >= TOTAL_SLIDES) {
        if (!updateUserCalled.current) {
          updateUserCalled.current = true;
          updateUser();
        }
        return prev;
      }
      return nextSlide;
    });
  };

  useEffect(() => {
    if (!focused) {
      return;
    }

    updateUserCalled.current = false;
    setCurrentSlide(0);

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    iconRotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 500 }),
        withTiming(-10, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1
    );

    // Animated dots - sequential fade in/out
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(600, withTiming(0.3, { duration: 300 }))
      ),
      -1
    );
    dot2Opacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(600, withTiming(0.3, { duration: 300 }))
        ),
        -1
      )
    );
    dot3Opacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(600, withTiming(0.3, { duration: 300 }))
        ),
        -1
      )
    );

    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
    };
  }, [focused]);

  // Handle slide transitions
  useEffect(() => {
    if (!focused || currentSlide >= TOTAL_SLIDES) {
      return;
    }

    // Reset and animate progress bar for current slide
    progressWidth.value = 0;
    progressWidth.value = withTiming(100, {
      duration: SLIDE_DURATION,
      easing: Easing.linear,
    });

    // Set timer for next slide
    slideTimerRef.current = setTimeout(() => {
      runOnJS(advanceSlide)();
    }, SLIDE_DURATION);

    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
    };
  }, [currentSlide, focused]);

  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  const currentSlideData = slides[currentSlide] || slides[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={currentSlideData.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      <View style={styles.slideContainer}>
        <Animated.View
          key={`slide-${currentSlide}`}
          entering={SlideInRight.duration(400)}
          exiting={SlideOutLeft.duration(400)}
          style={styles.slideContent}
        >
          {/* Animated Icon with Loading Text */}
          <View style={styles.loadingSection}>
            <Animated.View style={[styles.iconContainer, pulseStyle]}>
              <Animated.View style={iconStyle}>
                <FontAwesome6
                  name={currentSlideData.icon}
                  size={scale(36)}
                  color="white"
                />
              </Animated.View>
            </Animated.View>

            {/* Loading text with animated dots */}
            <View style={styles.loadingTextContainer}>
              <Text style={styles.loadingText}>{currentSlideData.title}</Text>
              <View style={styles.dotsContainer}>
                <Animated.Text style={[styles.dot, dot1Style]}>.</Animated.Text>
                <Animated.Text style={[styles.dot, dot2Style]}>.</Animated.Text>
                <Animated.Text style={[styles.dot, dot3Style]}>.</Animated.Text>
              </View>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.slideMessage}>{currentSlideData.message}</Text>
          </View>

          {/* User Info Badge */}
          <View style={styles.userInfoBadge}>
            <Text style={styles.userInfoText}>
              {userWeight} kg • {userHeight} cm • {userAge}{" "}
              {t("age").toLowerCase()}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
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
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    gap: scale(6),
  },
  progressBarBackground: {
    flex: 1,
    height: scale(4),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: scale(2),
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: scale(2),
  },
  slideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },
  slideContent: {
    alignItems: "center",
    width: "100%",
  },
  loadingSection: {
    alignItems: "center",
    marginBottom: scale(24),
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(12),
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  iconText: {
    fontSize: scale(40),
  },
  loadingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    ...fontStyles.headline2,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dotsContainer: {
    flexDirection: "row",
    marginLeft: scale(2),
  },
  dot: {
    ...fontStyles.headline2,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  imageContainer: {
    width: SCREEN_WIDTH - scale(48),
    height: scale(200),
    borderRadius: scale(24),
    overflow: "hidden",
    marginBottom: scale(32),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: scale(16),
  },
  slideMessage: {
    ...fontStyles.headline3,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: scale(28),
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userInfoBadge: {
    marginTop: scale(32),
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: scale(25),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userInfoText: {
    ...fontStyles.body1Bold,
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  decorativeCircle1: {
    position: "absolute",
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -scale(50),
    right: -scale(50),
  },
  decorativeCircle2: {
    position: "absolute",
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: scale(100),
    left: -scale(50),
  },
  decorativeCircle3: {
    position: "absolute",
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: scale(50),
    right: scale(30),
  },
});

export default AnalyzingScreen;
