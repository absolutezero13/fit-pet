import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { scale } from "../theme/utils";
import { useTheme } from "../theme/ThemeContext";

const TRACK_WIDTH = scale(200);
const INNER_PAD = scale(6);
const INNER_WIDTH = TRACK_WIDTH - INNER_PAD * 2;

type SegmentedTabBarProps = {
  options: string[];
  selectedIndex: number;
  onSelected: (index: number) => void;
};

function SegmentedTabBar({
  options,
  selectedIndex,
  onSelected,
}: SegmentedTabBarProps) {
  const { colors, isDark } = useTheme();
  const count = Math.max(options.length, 1);
  const segmentWidth = INNER_WIDTH / count;
  const safeIndex = Math.min(Math.max(0, selectedIndex), count - 1);
  const translateX = useSharedValue(safeIndex * segmentWidth);
  const trackHeight = scale(40);
  const innerHeight = trackHeight - INNER_PAD * 2;

  useEffect(() => {
    const idx = Math.min(Math.max(0, selectedIndex), count - 1);
    translateX.value = withSpring(idx * segmentWidth);
  }, [selectedIndex, segmentWidth, count, translateX]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.track,
        {
          width: TRACK_WIDTH,
          height: trackHeight,
          backgroundColor: isDark
            ? colors["color-primary-200"]
            : colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.innerClip,
          {
            margin: INNER_PAD,
            height: innerHeight,
            borderRadius: scale(96),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            thumbAnimatedStyle,
            {
              height: innerHeight,
              backgroundColor: colors.surface,
              borderRadius: scale(96),
            },
          ]}
        />
        <View style={[styles.row, { height: innerHeight }]}>
          {options.map((label, index) => {
            const selected = index === safeIndex;
            return (
              <Pressable
                key={`${label}-${index}`}
                style={styles.segment}
                onPress={() => onSelected(index)}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      color: selected ? colors.text : colors.textSecondary,
                      fontFamily: selected
                        ? "Nunito_700Bold"
                        : "Nunito_600SemiBold",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: "center",
    borderRadius: scale(99),
    borderWidth: StyleSheet.hairlineWidth,
  },
  innerClip: {
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  row: {
    flexDirection: "row",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: scale(13),
  },
});

export default function LiquidPicker(props: SegmentedTabBarProps) {
  return <SegmentedTabBar {...props} />;
}
