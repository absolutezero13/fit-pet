import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { scale, SCREEN_HEIGHT, SCREEN_WIDTH } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  FadeIn,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { useTranslation } from "react-i18next";
import badger from "./assets/badger-welcome.png";
import useAuthService, { LoginType } from "../services/auth";
import userService from "../services/user";
import { getAuth } from "@react-native-firebase/auth";
import { IUser } from "../zustand/useUserStore";
import { useTheme } from "../theme/ThemeContext";
import LoginTrueSheet from "./SettingsScreen/components/LoginTrueSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TrueSheetNames } from "../navigation/constants";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Floating orb component
const FloatingOrb = ({
  size,
  color,
  initialX,
  initialY,
  delay = 0,
}: {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay?: number;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const orbScale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in and scale up
    orbScale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 800 }));

    // Floating animation
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, {
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(20, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-15, {
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: orbScale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const authService = useAuthService();
  const [loading, setLoading] = React.useState(false);
  const insets = useSafeAreaInsets();

  // Animation values
  const mascotScale = useSharedValue(0);
  const mascotTranslateY = useSharedValue(20);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const cardTranslateY = useSharedValue(100);
  const cardOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const descOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);

  useEffect(() => {
    // Mascot entrance animation - clean drop-in with bounce
    mascotScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
    mascotTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 14, stiffness: 80 }),
    );

    // Gentle floating idle animation after entrance
    setTimeout(() => {
      mascotTranslateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }, 800);

    // Glow animation
    glowOpacity.value = withDelay(400, withTiming(0.6, { duration: 800 }));
    glowScale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.9, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );

    // Card slide up
    cardTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 90 }),
    );
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    // Staggered text animations
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(500, withSpring(0, { damping: 12 }));
    subtitleOpacity.value = withDelay(650, withTiming(1, { duration: 500 }));
    descOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));

    // Button entrance
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
    buttonScale.value = withDelay(900, withSpring(1, { damping: 10 }));
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: mascotScale.value },
      { translateY: mascotTranslateY.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const loginSilent = async () => {
    try {
      await getAuth().signOut();
    } catch (error) {}
    setLoading(true);

    let user: undefined | IUser;
    console.log("getAuth().currentUser", getAuth().currentUser);

    if (!getAuth().currentUser) {
      console.log("signing in");
      const response = await authService.handleLogin(LoginType.Anonymous);

      console.log("response", response);
      const { success, user: loginUser } = response;

      console.log("loginUser", loginUser);
      console.log("success", success);
      if (!success || !loginUser) {
        setLoading(false);
        console.error("Google login failed");
        return;
      }
      user = loginUser;
    } else {
      console.log("getting user");
      user = (await userService.getUser()).user;
    }
    console.log("user after login", user);

    if (user?.onboardingCompleted) {
      await userService.getUser();

      navigation.reset({
        routes: [{ name: "HomeTabs" }],
        index: 0,
      });
    } else {
      navigation.navigate("Onboarding");
    }
    setLoading(false);
  };

  const openLoginSheet = () => {
    TrueSheet.present(TrueSheetNames.LOGIN);
  };

  // Theme-aware gradient colors
  const gradientColors = isDark
    ? (["#0A1628", "#162A46", "#1F3A5F"] as const)
    : (["#E8F0FF", "#D4E4FF", "#C0D8FF"] as const);

  const accentColor = isDark ? "#4A90E2" : "#3B7DD8";
  const orbColors = isDark
    ? [
        "rgba(74, 144, 226, 0.15)",
        "rgba(147, 112, 219, 0.12)",
        "rgba(72, 209, 204, 0.1)",
      ]
    : [
        "rgba(59, 125, 216, 0.2)",
        "rgba(147, 112, 219, 0.15)",
        "rgba(72, 209, 204, 0.15)",
      ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating orbs background */}
      <FloatingOrb
        size={scale(180)}
        color={orbColors[0]}
        initialX={-scale(40)}
        initialY={scale(100)}
        delay={100}
      />
      <FloatingOrb
        size={scale(120)}
        color={orbColors[1]}
        initialX={SCREEN_WIDTH - scale(80)}
        initialY={scale(180)}
        delay={300}
      />
      <FloatingOrb
        size={scale(90)}
        color={orbColors[2]}
        initialX={scale(60)}
        initialY={SCREEN_HEIGHT * 0.35}
        delay={500}
      />
      <FloatingOrb
        size={scale(60)}
        color={orbColors[0]}
        initialX={SCREEN_WIDTH - scale(100)}
        initialY={SCREEN_HEIGHT * 0.4}
        delay={200}
      />

      {/* Hero section with mascot */}
      <View
        style={[styles.heroSection, { paddingTop: insets.top + scale(40) }]}
      >
        {/* Glow effect behind mascot */}
        <Animated.View style={[styles.glowContainer, glowStyle]}>
          <LinearGradient
            colors={[
              isDark ? "rgba(74, 144, 226, 0.4)" : "rgba(59, 125, 216, 0.3)",
              isDark ? "rgba(147, 112, 219, 0.3)" : "rgba(147, 112, 219, 0.2)",
              "transparent",
            ]}
            style={styles.glow}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>

        <Animated.View style={mascotStyle}>
          <Image source={badger} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </View>

      {/* Content card */}
      <Animated.View
        style={[
          styles.contentCard,
          { backgroundColor: colors.surface },
          cardStyle,
        ]}
      >
        <View style={styles.cardHandle} />

        <Animated.Text
          style={[styles.welcomeLabel, { color: accentColor }, subtitleStyle]}
        >
          {t("welcome")}
        </Animated.Text>

        <Animated.Text
          style={[styles.appName, { color: colors.text }, titleStyle]}
        >
          {t("appName")}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.description,
            { color: colors.textSecondary },
            descStyle,
          ]}
        >
          {t("welcomeExplanation")}
        </Animated.Text>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <AppButton
            title={t("getStarted")}
            loading={loading}
            onPress={loginSilent}
            backgroundColor={accentColor}
          />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1000).duration(400)}
          style={styles.loginContainer}
        >
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>
            {t("existingUser")}
          </Text>
          <TouchableOpacity onPress={openLoginSheet} activeOpacity={0.7}>
            <Text style={[styles.loginLink, { color: accentColor }]}>
              {t("login")}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View
          style={[styles.bottomIndicator, { backgroundColor: colors.border }]}
        />
      </Animated.View>

      <LoginTrueSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glowContainer: {
    position: "absolute",
    width: scale(400),
    height: scale(400),
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: "100%",
    height: "100%",
    borderRadius: scale(200),
  },
  image: {
    width: scale(280),
    height: scale(280),
  },
  contentCard: {
    borderTopLeftRadius: scale(40),
    borderTopRightRadius: scale(40),
    paddingHorizontal: scale(28),
    paddingTop: scale(20),
    paddingBottom: scale(36),
    minHeight: scale(360),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  cardHandle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    alignSelf: "center",
    marginBottom: scale(24),
  },
  welcomeLabel: {
    ...fontStyles.caption,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: scale(8),
  },
  appName: {
    ...fontStyles.hero,
    fontSize: scale(42),
    lineHeight: scale(50),
    textAlign: "center",
    marginBottom: scale(16),
  },
  description: {
    ...fontStyles.body1,
    fontSize: scale(15),
    lineHeight: scale(24),
    textAlign: "center",
    marginBottom: scale(32),
    paddingHorizontal: scale(8),
  },
  buttonContainer: {
    marginBottom: scale(20),
  },
  loginContainer: {
    alignItems: "center",
    marginBottom: scale(16),
    flexDirection: "row",
    alignSelf: "center",
    gap: scale(6),
  },
  loginText: {
    ...fontStyles.body2,
    fontSize: scale(13),
  },
  loginLink: {
    ...fontStyles.body2,
    fontSize: scale(13),
    fontWeight: "700",
  },
  bottomIndicator: {
    width: scale(134),
    height: scale(5),
    borderRadius: scale(3),
    alignSelf: "center",
  },
});

export default WelcomeScreen;
