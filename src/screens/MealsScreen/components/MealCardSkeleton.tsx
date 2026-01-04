import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { scale } from "../../../theme/utils";
import { useTheme } from "../../../theme/ThemeContext";

const MealCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({
    width,
    height,
    borderRadius = scale(8),
    style = {},
  }: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
  }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          borderRadius,
          opacity,
          backgroundColor: colors.skeleton,
        },
        style,
      ]}
    />
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonBox width={scale(120)} height={scale(24)} />
          <View style={styles.timeRow}>
            <SkeletonBox
              width={scale(18)}
              height={scale(18)}
              borderRadius={scale(9)}
            />
            <SkeletonBox
              width={scale(100)}
              height={scale(16)}
              style={{ marginLeft: scale(8) }}
            />
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.bodyText}>
          <SkeletonBox width="90%" height={scale(20)} />
          <SkeletonBox
            width="70%"
            height={scale(20)}
            style={{ marginTop: scale(8) }}
          />
        </View>
        <SkeletonBox
          width={scale(75)}
          height={scale(75)}
          borderRadius={scale(16)}
        />
      </View>

      {/* Macros */}
      <View style={[styles.macros, { borderTopColor: colors.border }]}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.macroItem}>
            <SkeletonBox width={scale(40)} height={scale(20)} />
            <SkeletonBox
              width={scale(50)}
              height={scale(14)}
              style={{ marginTop: scale(6) }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const MealsScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      <MealCardSkeleton />
      <MealCardSkeleton />
      <MealCardSkeleton />
    </View>
  );
};

export { MealCardSkeleton };
export default MealsScreenSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: scale(24),
    padding: scale(24),
    marginBottom: scale(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonBox: {},
  header: {
    marginBottom: scale(16),
  },
  headerLeft: {},
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(10),
  },
  body: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(20),
  },
  bodyText: {
    flex: 1,
    marginRight: scale(16),
  },
  macros: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: scale(20),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
  },
});

