import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { scale } from "../../../theme/utils";
import { colors } from "../../../theme/colors";

const SkeletonBox = ({
  width,
  height,
  borderRadius = scale(8),
  style,
  color = colors["color-primary-200"],
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  color?: string;
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        { width: width as any, height, borderRadius, backgroundColor: color },
        animatedStyle,
        style,
      ]}
    />
  );
};

const DailySummarySkeleton = () => {
  return (
    <View style={styles.summaryContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <SkeletonBox width={scale(120)} height={scale(22)} />
        <SkeletonBox
          width={scale(22)}
          height={scale(22)}
          borderRadius={scale(11)}
        />
      </View>

      {/* Calories Hero Section */}
      <View style={styles.caloriesHero}>
        <View style={styles.caloriesMainRow}>
          {/* Left: Icon + Value */}
          <View style={styles.caloriesConsumed}>
            <SkeletonBox
              width={scale(48)}
              height={scale(48)}
              borderRadius={scale(14)}
              color="#FFE4B8"
            />
            <View style={{ marginLeft: scale(12) }}>
              <SkeletonBox
                width={scale(80)}
                height={scale(32)}
                color="#FFE4B8"
              />
              <SkeletonBox
                width={scale(60)}
                height={scale(12)}
                style={{ marginTop: scale(4) }}
                color="#FFE4B8"
              />
            </View>
          </View>
          {/* Right: Remaining */}
          <View style={styles.caloriesRemaining}>
            <SkeletonBox width={scale(70)} height={scale(28)} />
            <SkeletonBox
              width={scale(60)}
              height={scale(12)}
              style={{ marginTop: scale(4) }}
            />
          </View>
        </View>
        {/* Progress Bar */}
        <SkeletonBox
          width="100%"
          height={scale(8)}
          borderRadius={scale(4)}
          color="#FFE4B8"
          style={{ marginBottom: scale(8) }}
        />
        {/* Goal Text */}
        <SkeletonBox
          width={scale(100)}
          height={scale(12)}
          style={{ alignSelf: "center" }}
        />
      </View>

      {/* Protein Card */}
      <View style={styles.proteinCard}>
        <View style={styles.proteinRow}>
          <SkeletonBox
            width={scale(36)}
            height={scale(36)}
            borderRadius={scale(10)}
            color="#C8E6C9"
          />
          <View style={styles.proteinInfo}>
            <SkeletonBox width={scale(60)} height={scale(14)} color="#C8E6C9" />
            <SkeletonBox
              width={scale(80)}
              height={scale(16)}
              style={{ marginTop: scale(4) }}
              color="#C8E6C9"
            />
          </View>
          <SkeletonBox width={scale(40)} height={scale(20)} color="#C8E6C9" />
        </View>
        <SkeletonBox
          width="100%"
          height={scale(6)}
          borderRadius={scale(3)}
          color="#C8E6C9"
        />
      </View>

      {/* Other Macros Row */}
      <View style={styles.otherMacrosRow}>
        {/* Carbs */}
        <View style={styles.miniMacroCard}>
          <SkeletonBox
            width={scale(32)}
            height={scale(32)}
            borderRadius={scale(10)}
            color="#BBDEFB"
          />
          <SkeletonBox
            width={scale(35)}
            height={scale(12)}
            style={{ marginTop: scale(6) }}
          />
          <SkeletonBox
            width={scale(30)}
            height={scale(16)}
            style={{ marginTop: scale(4), marginBottom: scale(6) }}
          />
          <SkeletonBox width="100%" height={scale(4)} borderRadius={scale(2)} />
        </View>

        {/* Fats */}
        <View style={styles.miniMacroCard}>
          <SkeletonBox
            width={scale(32)}
            height={scale(32)}
            borderRadius={scale(10)}
            color="#FFCCBC"
          />
          <SkeletonBox
            width={scale(30)}
            height={scale(12)}
            style={{ marginTop: scale(6) }}
          />
          <SkeletonBox
            width={scale(30)}
            height={scale(16)}
            style={{ marginTop: scale(4), marginBottom: scale(6) }}
          />
          <SkeletonBox width="100%" height={scale(4)} borderRadius={scale(2)} />
        </View>

        {/* Score */}
        <View style={styles.miniMacroCard}>
          <SkeletonBox
            width={scale(32)}
            height={scale(32)}
            borderRadius={scale(10)}
            color="#E8E8E8"
          />
          <SkeletonBox
            width={scale(35)}
            height={scale(12)}
            style={{ marginTop: scale(6) }}
          />
          <SkeletonBox
            width={scale(25)}
            height={scale(16)}
            style={{ marginTop: scale(4) }}
          />
        </View>
      </View>
    </View>
  );
};

const MealCardSkeleton = () => {
  return (
    <View style={styles.mealCard}>
      <SkeletonBox
        width={scale(48)}
        height={scale(48)}
        borderRadius={scale(12)}
      />
      <View style={styles.mealInfo}>
        <SkeletonBox width="70%" height={scale(16)} />
        <View style={styles.macroBadges}>
          <SkeletonBox
            width={scale(60)}
            height={scale(22)}
            borderRadius={scale(11)}
          />
          <SkeletonBox
            width={scale(45)}
            height={scale(22)}
            borderRadius={scale(11)}
          />
        </View>
      </View>
      <SkeletonBox
        width={scale(44)}
        height={scale(24)}
        borderRadius={scale(12)}
      />
    </View>
  );
};

const MealSectionSkeleton = () => {
  return (
    <View style={styles.sectionContainer}>
      <SkeletonBox
        width={scale(90)}
        height={scale(22)}
        style={{ marginBottom: scale(12) }}
      />
      <MealCardSkeleton />
    </View>
  );
};

export const HomeScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      <DailySummarySkeleton />
      <MealSectionSkeleton />
      <MealSectionSkeleton />
      <MealSectionSkeleton />
      <MealSectionSkeleton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonBox: {
    backgroundColor: colors["color-primary-200"],
  },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  // Daily Summary Container
  summaryContainer: {
    backgroundColor: "white",
    borderRadius: scale(24),
    padding: scale(20),
    marginBottom: scale(16),
  },
  // Calories Hero
  caloriesHero: {
    backgroundColor: "#FFFBF5",
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(16),
  },
  caloriesMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
  },
  caloriesConsumed: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesRemaining: {
    flex: 1,
    alignItems: "flex-end",
  },
  // Protein Card
  proteinCard: {
    backgroundColor: "#F0F9F0",
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: scale(12),
  },
  proteinRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(10),
  },
  proteinInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  // Other Macros
  otherMacrosRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  miniMacroCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: scale(14),
    padding: scale(12),
    alignItems: "center",
  },
  // Meal Section
  sectionContainer: {
    marginBottom: scale(12),
  },
  mealCard: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(12),
    flexDirection: "row",
    alignItems: "center",
  },
  mealInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  macroBadges: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: scale(8),
  },
});

export default HomeScreenSkeleton;
