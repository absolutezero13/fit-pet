import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

export interface CookChipOption {
  label: string;
  value: string;
}

interface CookOptionChipsProps {
  options: CookChipOption[];
  selectedValue?: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
}

interface CookChipItemProps {
  option: CookChipOption;
  selectedValue?: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
}

const CookChipItem = ({
  option,
  selectedValue,
  disabled = false,
  onSelect,
}: CookChipItemProps) => {
  const { colors } = useTheme();
  const isSelected = option.value === selectedValue;
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 140 });
  }, [isSelected, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors["color-success-400"]]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors["color-success-400"]]
    ),
    transform: [{ scale: 1 - progress.value * 0.02 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.text, colors.textInverse]
    ),
  }));

  return (
    <Pressable
      key={option.value}
      disabled={disabled}
      onPress={() => onSelect(option.value)}
    >
      <Animated.View style={[styles.chip, chipStyle, disabled ? styles.disabled : null]}>
        <Animated.Text style={[styles.label, labelStyle]}>{option.label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const CookOptionChips = ({
  options,
  selectedValue,
  disabled = false,
  onSelect,
}: CookOptionChipsProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <CookChipItem
          key={option.value}
          option={option}
          selectedValue={selectedValue}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: scale(10),
  },
  chip: {
    borderWidth: 1,
    borderRadius: scale(20),
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    width: "100%",
  },
  disabled: {
    opacity: 0.9,
  },
  label: {
    ...fontStyles.body1Bold,
  },
});

export default CookOptionChips;
