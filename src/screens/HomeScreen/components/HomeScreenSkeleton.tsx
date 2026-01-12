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
import { useTheme } from "../../../theme/ThemeContext";

const SkeletonBox = ({
  width,
  height,
  borderRadius = scale(8),
  style,
  color,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  color?: string;
}) => {
  const { colors } = useTheme();
  const skeletonColor = color || colors.skeleton;
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
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: skeletonColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const DailySummarySkeleton = () => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.summaryContainer, { backgroundColor: colors.surface }]}
    >
      <View style={styles.ringSection}>
        <View style={styles.sideStats}>
          <SkeletonBox width={scale(50)} height={scale(20)} />
          <SkeletonBox
            width={scale(60)}
            height={scale(12)}
            style={{ marginTop: scale(4) }}
          />
        </View>

        <View style={styles.ringContainer}>
          <SkeletonBox
            width={scale(140)}
            height={scale(140)}
            borderRadius={scale(70)}
          />
        </View>

        <View style={styles.sideStats}>
          <SkeletonBox width={scale(50)} height={scale(20)} />
          <SkeletonBox
            width={scale(45)}
            height={scale(12)}
            style={{ marginTop: scale(4) }}
          />
        </View>
      </View>

      <View style={styles.macrosSection}>
        <View style={styles.macroItem}>
          <SkeletonBox width={scale(50)} height={scale(12)} />
          <SkeletonBox
            width="100%"
            height={scale(5)}
            borderRadius={scale(3)}
            style={{ marginVertical: scale(6) }}
          />
          <SkeletonBox width={scale(55)} height={scale(12)} />
        </View>
        <View style={styles.macroItem}>
          <SkeletonBox width={scale(35)} height={scale(12)} />
          <SkeletonBox
            width="100%"
            height={scale(5)}
            borderRadius={scale(3)}
            style={{ marginVertical: scale(6) }}
          />
          <SkeletonBox width={scale(50)} height={scale(12)} />
        </View>
        <View style={styles.macroItem}>
          <SkeletonBox width={scale(40)} height={scale(12)} />
          <SkeletonBox
            width="100%"
            height={scale(5)}
            borderRadius={scale(3)}
            style={{ marginVertical: scale(6) }}
          />
          <SkeletonBox width={scale(55)} height={scale(12)} />
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <SkeletonBox
          width={scale(180)}
          height={scale(36)}
          borderRadius={scale(18)}
        />
      </View>
    </View>
  );
};

const MealCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.mealCard, { backgroundColor: colors.surface }]}>
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
    paddingHorizontal: scale(24),
  },
  skeletonBox: {},
  summaryContainer: {
    borderRadius: scale(24),
    padding: scale(20),
    marginBottom: scale(16),
  },
  ringSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(20),
    gap: scale(8),
  },
  sideStats: {
    alignItems: "center",
    minWidth: scale(70),
  },
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  macrosSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: scale(16),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
  },
  toggleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionContainer: {
    marginBottom: scale(12),
  },
  mealCard: {
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
