import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
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
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { storageService } from "../../../storage/AsyncStorageService";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";

const { width } = Dimensions.get("window");

const AnalyzingScreen = ({ focused }) => {
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
  const rotation = useSharedValue(0);
  const rotationReverse = useSharedValue(0);
  const bounce = useSharedValue(0);
  const scale = useSharedValue(1);
  const orbitRadius = useSharedValue(0);
  const statusOpacity = useSharedValue(1);
  const statusY = useSharedValue(0);

  // Info card animations
  const cardScales = Array(4)
    .fill(0)
    .map(() => useSharedValue(0));

  const updateStatus = () => {
    setTimeout(() => {
      setCurrentStatus((prev) => (prev + 1) % statusMessages.length);
    }, 200);
  };

  useEffect(() => {
    if (!focused) {
      return;
    }

    storageService.setItem("User", {
      ...useOnboardingStore.getState(),
      mealInfo: {
        date: new Date().toISOString(),
        meals: [],
      },
    });

    setTimeout(() => {
      navigation.navigate("HomeTabs");
    }, 10000);

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
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1
    );

    rotationReverse.value = withRepeat(
      withTiming(-360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    bounce.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 2, stiffness: 80 }),
        withSpring(0, { damping: 2, stiffness: 80 })
      ),
      -1
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 700 }),
        withTiming(0.8, { duration: 700 })
      ),
      -1
    );

    orbitRadius.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1
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

    return () => clearInterval(statusInterval);
  }, [focused]);

  // Animated styles
  const mainLoaderStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: interpolate(bounce.value, [0, 1], [1, 1.2]) },
    ],
  }));

  const orbitingLoaderStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotationReverse.value}deg` },
      { scale: scale.value },
      { translateX: orbitRadius.value },
    ],
  }));

  const statusTextStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
    transform: [{ translateY: statusY.value }],
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

  const InfoCard = ({ label, value, style }) => (
    <Animated.View style={[styles.infoCard, style]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Status Message */}
        <Animated.Text style={[styles.statusText, statusTextStyle]}>
          {statusMessages[currentStatus]}
        </Animated.Text>

        {/* Crazy Loader */}
        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.mainLoader, mainLoaderStyle]}>
            <View style={styles.loaderInnerRing} />
            <View style={styles.loaderCore} />
          </Animated.View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <InfoCard
              label={t("age")}
              value={`${useOnboardingStore.getState().age} years`}
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
              value={useOnboardingStore.getState().gender}
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
  },
  content: {
    alignItems: "center",
    padding: scale(24),
  },
  statusText: {
    ...fontStyles.headline3,
    marginBottom: scale(32),
    textAlign: "center",
  },
  loaderContainer: {
    height: scale(120),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(30),
  },
  mainLoader: {
    width: scale(80),
    height: scale(80),
    alignItems: "center",
    justifyContent: "center",
  },
  loaderRing: {
    width: "100%",
    height: "100%",
    borderRadius: scale(40),
    borderWidth: scale(4),
    borderColor: colors["color-primary-900"],
    borderStyle: "dotted",
  },
  loaderInnerRing: {
    position: "absolute",
    width: "70%",
    height: "70%",
    borderRadius: scale(35),
    borderWidth: scale(3),
    borderColor: colors["color-primary-300"],
  },
  loaderCore: {
    position: "absolute",
    width: "40%",
    height: "40%",
    borderRadius: scale(20),
    backgroundColor: colors["color-primary-300"],
  },
  orbitingLoader: {
    position: "absolute",
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: colors["color-primary-900"],
  },
  infoContainer: {
    width: SCREEN_WIDTH - scale(40),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(12),
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    width: (width - scale(52)) / 2,
    ...shadowStyle,
  },
  infoLabel: {
    ...fontStyles.body1,
    marginBottom: scale(4),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    ...fontStyles.headline3,
    color: colors["color-success-900"],
  },
});

export default AnalyzingScreen;
