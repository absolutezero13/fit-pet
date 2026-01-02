import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { storageService } from "../../../storage/AsyncStorageService";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore, {
  GenderEnum,
} from "../../../zustand/useOnboardingStore";
import { MacroGoals } from "../../../zustand/useUserStore";
import { createGeminiCompletion } from "../../../services/gptApi";
import promptBuilder from "../../../utils/promptBuilder";
import userService from "../../../services/user";
import { getCrashlytics } from "@react-native-firebase/crashlytics";

const { width } = Dimensions.get("window");
const ORBIT_RADIUS_PRIMARY = scale(54);
const ORBIT_RADIUS_SECONDARY = scale(44);
const DEFAULT_MACRO_GOALS: MacroGoals = {
  calories: 2000,
  proteins: 30,
  carbs: 40,
  fats: 30,
};

const AnalyzingScreen = ({ focused }: { focused: boolean }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentStatus, setCurrentStatus] = React.useState(0);
  const statusMessages = [
    t("analyzing"),
    t("calculating"),
    t("finding"),
    t("optimizing"),
    t("almostThere"),
  ];

  // Animation values
  const haloPulse = useSharedValue(1);
  const coreScale = useSharedValue(1);
  const orbitRotation = useSharedValue(0);
  const orbitRotationReverse = useSharedValue(0);
  const floatingBackground = useSharedValue(0);
  const progress = useSharedValue(1 / statusMessages.length);
  const statusOpacity = useSharedValue(1);
  const statusY = useSharedValue(0);

  // Info card animations
  const cardScales = Array(4)
    .fill(0)
    .map(() => useSharedValue(0));

  const updateStatus = () => {
    setTimeout(() => {
      setCurrentStatus((prev) => {
        const next = (prev + 1) % statusMessages.length;
        progress.value = withTiming(
          (next + 1) / statusMessages.length,
          { duration: 600, easing: Easing.out(Easing.exp) }
        );
        return next;
      });
    }, 200);
  };

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

    navigation.navigate("HomeTabs");
  };

  useEffect(() => {
    if (!focused) {
      return;
    }

    if (Platform.OS !== "web") {
      updateUser();
    }

    // Animate status message every 2 seconds
    const statusInterval = setInterval(() => {
      statusOpacity.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      statusY.value = withSequence(
        withTiming(20, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
      runOnJS(updateStatus)();
    }, 2000);

    // Main animations
    haloPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900 }),
        withTiming(0.92, { duration: 900 })
      ),
      -1,
      true
    );

    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 700 }),
        withTiming(0.96, { duration: 700 })
      ),
      -1,
      true
    );

    orbitRotation.value = withRepeat(
      withTiming(360, {
        duration: 3200,
        easing: Easing.linear,
      }),
      -1
    );

    orbitRotationReverse.value = withRepeat(
      withTiming(-360, {
        duration: 3800,
        easing: Easing.linear,
      }),
      -1
    );

    floatingBackground.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      true
    );

    progress.value = withTiming(
      1 / statusMessages.length,
      { duration: 600, easing: Easing.out(Easing.exp) }
    );

    // Staggered card animations
    cardScales.forEach((cardScale, index) => {
      cardScale.value = withDelay(
        200 * (index + 1),
        withSpring(1, {
          damping: 8,
          stiffness: 100,
          mass: 0.5,
        })
      );
    });

    return () => {
      clearInterval(statusInterval);
      cancelAnimation(haloPulse);
      cancelAnimation(coreScale);
      cancelAnimation(orbitRotation);
      cancelAnimation(orbitRotationReverse);
      cancelAnimation(floatingBackground);
      cancelAnimation(progress);
    };
  }, [focused]);

  // Animated styles
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloPulse.value }],
    opacity: interpolate(haloPulse.value, [0.92, 1.08], [0.35, 0.6]),
  }));
  const statusTextStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
    transform: [{ translateY: statusY.value }],
  }));
  const coreLoaderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
    shadowOpacity: interpolate(coreScale.value, [0.96, 1.05], [0.12, 0.32]),
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${orbitRotation.value}deg` },
      { translateX: ORBIT_RADIUS_PRIMARY },
    ],
  }));

  const orbitReverseStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${orbitRotationReverse.value}deg` },
      { translateX: ORBIT_RADIUS_SECONDARY },
    ],
  }));

  const blobOneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatingBackground.value, [0, 1], [0, -12]) },
      { scale: interpolate(floatingBackground.value, [0, 1], [1, 1.05]) },
    ],
  }));

  const blobTwoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatingBackground.value, [0, 1], [-6, 6]) },
      { scale: interpolate(floatingBackground.value, [0, 1], [1.02, 0.98]) },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const cardAnimations = cardScales.map((animValue) =>
    useAnimatedStyle(() => ({
      transform: [
        { scale: animValue.value },
        { rotate: `${interpolate(animValue.value, [0, 1], [-15, 0])}deg` },
      ],
      opacity: animValue.value,
    }))
  );

  const InfoCard = ({
    label,
    value,
    style,
  }: {
    label: string;
    value: string | null;
    style: any;
  }) => (
    <Animated.View style={[styles.infoCard, style]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.gradientBlob, styles.blobPrimary, blobOneStyle]}
      />
      <Animated.View
        style={[styles.gradientBlob, styles.blobSecondary, blobTwoStyle]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t("analyzing")}</Text>
          <Text style={styles.title}>{t("almostThere")}</Text>
          <Text style={styles.subtitle}>{`${t("optimizing")}...`}</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>

        <Animated.Text
          onPress={updateUser}
          style={[styles.statusText, statusTextStyle]}
        >
          {statusMessages[currentStatus]}
        </Animated.Text>

        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.halo, haloStyle]} />
          <Animated.View style={[styles.loaderCore, coreLoaderStyle]}>
            <View style={styles.loaderGlow} />
            <View style={styles.loaderInnerCore} />
          </Animated.View>
          <Animated.View style={[styles.orbitDot, orbitStyle]} />
          <Animated.View
            style={[styles.orbitDot, styles.orbitDotSecondary, orbitReverseStyle]}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <InfoCard
              label={t("age")}
              value={`${
                new Date().getFullYear() -
                (useOnboardingStore.getState().yearOfBirth ?? 1990)
              } years`}
              style={cardAnimations[0]}
            />
            <InfoCard
              label={t("height")}
              value={`${useOnboardingStore.getState().height} cm`}
              style={cardAnimations[1]}
            />
          </View>
          <View style={styles.infoRow}>
            <InfoCard
              label={t("weight")}
              value={`${useOnboardingStore.getState().weight} kg`}
              style={cardAnimations[2]}
            />
            <InfoCard
              label={t("gender")}
              value={
                (useOnboardingStore.getState().gender as GenderEnum) || "-"
              }
              style={cardAnimations[3]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors["color-primary-900"],
  },
  content: {
    alignItems: "center",
    padding: scale(24),
    gap: scale(14),
  },
  gradientBlob: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    opacity: 0.32,
  },
  blobPrimary: {
    backgroundColor: colors["color-info-300"],
    top: -width * 0.2,
    left: -width * 0.1,
  },
  blobSecondary: {
    backgroundColor: colors["color-warning-300"],
    bottom: -width * 0.15,
    right: -width * 0.25,
  },
  header: {
    width: "100%",
    gap: scale(4),
  },
  kicker: {
    ...fontStyles.body1Bold,
    color: colors["color-info-900"],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    ...fontStyles.headline1,
    color: colors["color-primary-50"],
  },
  subtitle: {
    ...fontStyles.body1,
    color: colors["color-primary-200"],
  },
  statusText: {
    ...fontStyles.headline3,
    color: colors["color-primary-50"],
    marginBottom: scale(12),
    textAlign: "center",
  },
  loaderContainer: {
    height: scale(140),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(10),
    marginTop: scale(8),
  },
  halo: {
    position: "absolute",
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: colors["color-info-100"],
  },
  loaderCore: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: colors["color-primary-800"],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors["color-info-400"],
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
  },
  loaderGlow: {
    position: "absolute",
    width: "90%",
    height: "90%",
    borderRadius: scale(48),
    borderWidth: scale(2),
    borderColor: colors["color-info-400"],
    opacity: 0.5,
  },
  loaderInnerCore: {
    width: "62%",
    height: "62%",
    borderRadius: scale(32),
    backgroundColor: colors["color-info-300"],
  },
  orbitDot: {
    position: "absolute",
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: colors["color-info-400"],
    opacity: 0.9,
  },
  orbitDotSecondary: {
    backgroundColor: colors["color-warning-300"],
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    opacity: 0.8,
  },
  infoContainer: {
    width: SCREEN_WIDTH - scale(40),
    marginTop: scale(6),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(12),
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: scale(18),
    padding: scale(16),
    width: (width - scale(52)) / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    ...shadowStyle,
  },
  infoLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-200"],
    marginBottom: scale(4),
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoValue: {
    ...fontStyles.headline2,
    color: colors["color-primary-50"],
  },
  progressTrack: {
    width: "100%",
    height: scale(10),
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: scale(12),
    overflow: "hidden",
    marginTop: scale(6),
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors["color-info-400"],
    borderRadius: scale(12),
  },
});

export default AnalyzingScreen;
