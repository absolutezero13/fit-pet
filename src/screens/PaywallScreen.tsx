import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeInDown,
  FadeIn,
  interpolateColor,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import AppButton from "../components/AppButton";
import { useTheme } from "../theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

interface PlanProps {
  id: string;
  name: string;
  price: string;
  period: string;
  savings?: string;
  isPopular?: boolean;
  pricePerWeek: string;
}

const plans: PlanProps[] = [
  {
    id: "yearly",
    name: "Yearly",
    price: "$39.99",
    period: "/year",
    isPopular: true,
    pricePerWeek: "$0.77/week",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "$9.99",
    period: "/month",
    pricePerWeek: "$2.50/week",
  },
];

const features = [
  {
    icon: "camera-enhance" as const,
    title: "Unlimited AI Meal Scans",
    description: "Scan any meal instantly",
  },
  {
    icon: "robot-happy" as const,
    title: "Personal AI Nutritionist",
    description: "24/7 diet advice & coaching",
  },
  {
    icon: "lightning-bolt" as const,
    title: "Personalized Meal Recipes",
    description: "AI-generated recipes for you",
  },
];

const FeatureRow = ({
  icon,
  title,
  description,
  index,
  accentColor,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  index: number;
  accentColor: string;
}) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(400 + index * 100)
        .duration(500)
        .springify()}
      style={styles.featureRow}
    >
      <View
        style={[styles.featureIcon, { backgroundColor: `${accentColor}20` }]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={scale(20)}
          color={accentColor}
        />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.featureDescription, { color: colors.textSecondary }]}
        >
          {description}
        </Text>
      </View>
    </Animated.View>
  );
};

const PlanCard = ({
  plan,
  isSelected,
  onSelect,
  accentColor,
  borderUnselectedColor,
}: {
  plan: PlanProps;
  isSelected: boolean;
  onSelect: () => void;
  accentColor: string;
  borderUnselectedColor: string;
}) => {
  const { colors } = useTheme();
  const borderProgress = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    borderProgress.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
    if (isSelected) {
      scaleValue.value = withSequence(
        withTiming(0.97, { duration: 100 }),
        withSpring(1, { damping: 10 }),
      );
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderProgress.value,
      [0, 1],
      [borderUnselectedColor, accentColor],
    );
    return {
      borderColor,
      borderWidth: 2,
      transform: [{ scale: scaleValue.value }],
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onSelect}>
      <Animated.View
        style={[
          styles.planCard,
          { backgroundColor: colors.surface },
          animatedStyle,
        ]}
      >
        {plan.isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: accentColor }]}>
            <Text style={[styles.popularText, { color: colors.white }]}>
              MOST POPULAR
            </Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planRadio}>
            <View
              style={[
                styles.radioOuter,
                { borderColor: isSelected ? accentColor : colors.textTertiary },
              ]}
            >
              {isSelected && (
                <View
                  style={[styles.radioInner, { backgroundColor: accentColor }]}
                />
              )}
            </View>
          </View>
          <View style={styles.planInfo}>
            <Text style={[styles.planName, { color: colors.text }]}>
              {plan.name}
            </Text>
            <Text
              style={[styles.planPriceWeek, { color: colors.textSecondary }]}
            >
              {plan.pricePerWeek}
            </Text>
          </View>
          <View style={styles.planPricing}>
            <View style={styles.priceRow}>
              <Text style={[styles.planPrice, { color: colors.text }]}>
                {plan.price}
              </Text>
              <Text
                style={[styles.planPeriod, { color: colors.textSecondary }]}
              >
                {plan.period}
              </Text>
            </View>
            {plan.savings && (
              <View
                style={[
                  styles.savingsBadge,
                  { backgroundColor: `${colors.accent}20` },
                ]}
              >
                <Text style={[styles.savingsText, { color: colors.accent }]}>
                  {plan.savings}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const PaywallScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const crownRotate = useSharedValue(0);
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withDelay(100, withSpring(1, { damping: 12 }));
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));

    crownRotate.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(-4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000 }),
        ),
        -1,
        false,
      ),
    );

    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${crownRotate.value}deg` }],
  }));

  const handleContinue = () => {
    navigation.navigate("Onboarding");
  };

  const handleSkip = () => {
    if (auth().currentUser) {
      navigation.reset({ index: 0, routes: [{ name: "HomeTabs" }] });
      return;
    }
    navigation.navigate("Onboarding");
  };

  const handleRestore = () => {
    console.log("Restore purchases");
  };

  const footerLinks = [
    { key: "restore", label: "Restore Purchases", onPress: handleRestore },
    { key: "terms", label: "Terms", onPress: () => {} },
    { key: "privacy", label: "Privacy", onPress: () => {} },
  ];

  const paywallAccent = colors.accent;
  const crownColor = colors.accent;
  const planBorderUnselected = isDark
    ? colors.border
    : colors["color-primary-200"];

  const gradientColors = isDark
    ? ([colors.background, colors.backgroundSecondary, colors.surface] as const)
    : ([
        colors.backgroundSecondary,
        colors.background,
        colors.surface,
      ] as const);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <Animated.View
        entering={FadeIn.delay(800).duration(400)}
        style={[styles.skipButton, { top: insets.top + scale(8) }]}
      >
        <TouchableOpacity
          onPress={handleSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close"
            size={scale(28)}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + scale(16),
            paddingBottom: insets.bottom + scale(12),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <Animated.View style={crownStyle}>
            <View
              style={[
                styles.crownContainer,
                { backgroundColor: `${crownColor}20` },
              ]}
            >
              <MaterialCommunityIcons
                name="crown"
                size={scale(40)}
                color={crownColor}
              />
            </View>
          </Animated.View>
          <Text style={[styles.title, { color: colors.text }]}>
            Unlock Your
          </Text>
          <Text style={[styles.titleAccent, { color: paywallAccent }]}>
            Full Potential
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Get unlimited access to all premium features
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <FeatureRow
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              accentColor={paywallAccent}
            />
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(800).duration(500).springify()}
          style={styles.plansContainer}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              accentColor={paywallAccent}
              borderUnselectedColor={planBorderUnselected}
            />
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(1000).duration(500)}
          style={styles.ctaContainer}
        >
          <AppButton
            title="Continue"
            onPress={handleContinue}
            backgroundColor={paywallAccent}
          />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1100).duration(400)}
          style={styles.footer}
        >
          {footerLinks.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && (
                <Text
                  style={[styles.footerDot, { color: colors.textTertiary }]}
                >
                  •
                </Text>
              )}
              <TouchableOpacity onPress={item.onPress}>
                <Text
                  style={[styles.footerLink, { color: colors.textSecondary }]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1200).duration(400)}
          style={styles.trialInfo}
        >
          <Ionicons
            name="shield-checkmark"
            size={scale(16)}
            color={colors.textTertiary}
          />
          <Text style={[styles.trialText, { color: colors.textTertiary }]}>
            Cancel anytime. No commitment required.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
  },
  skipButton: {
    position: "absolute",
    right: scale(16),
    zIndex: 10,
    padding: scale(8),
  },
  header: {
    alignItems: "center",
    marginBottom: scale(20),
  },
  crownContainer: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(12),
  },
  title: {
    ...fontStyles.hero,
    fontSize: scale(28),
    lineHeight: scale(34),
    textAlign: "center",
  },
  titleAccent: {
    ...fontStyles.hero,
    fontSize: scale(32),
    lineHeight: scale(38),
    textAlign: "center",
    marginBottom: scale(8),
  },
  subtitle: {
    ...fontStyles.body1,
    fontSize: scale(14),
    textAlign: "center",
    paddingHorizontal: scale(16),
  },
  featuresContainer: {
    marginBottom: scale(16),
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(10),
  },
  featureIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...fontStyles.headline4,
    fontSize: scale(14),
    marginBottom: scale(2),
  },
  featureDescription: {
    ...fontStyles.body2,
    fontSize: scale(11),
  },
  plansContainer: {
    gap: scale(10),
    marginBottom: scale(14),
  },
  planCard: {
    borderRadius: scale(14),
    padding: scale(12),
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: scale(12),
    paddingHorizontal: scale(10),
    paddingVertical: scale(2),
    borderBottomLeftRadius: scale(8),
    borderBottomRightRadius: scale(8),
  },
  popularText: {
    ...fontStyles.caption,
    fontSize: scale(8),
    fontWeight: "800",
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  planRadio: {
    marginRight: scale(12),
  },
  radioOuter: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...fontStyles.headline3,
    fontSize: scale(16),
  },
  planPriceWeek: {
    ...fontStyles.body2,
    fontSize: scale(12),
  },
  planPricing: {
    alignItems: "flex-end",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    ...fontStyles.headline2,
    fontSize: scale(20),
  },
  planPeriod: {
    ...fontStyles.body2,
    fontSize: scale(12),
  },
  savingsBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(6),
    marginTop: scale(4),
  },
  savingsText: {
    ...fontStyles.caption,
    fontSize: scale(10),
    fontWeight: "700",
  },
  ctaContainer: {
    marginBottom: scale(12),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(10),
  },
  footerLink: {
    ...fontStyles.body2,
    fontSize: scale(12),
  },
  footerDot: {
    marginHorizontal: scale(8),
    fontSize: scale(12),
  },
  trialInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(6),
  },
  trialText: {
    ...fontStyles.caption,
    fontSize: scale(11),
  },
});

export default PaywallScreen;
