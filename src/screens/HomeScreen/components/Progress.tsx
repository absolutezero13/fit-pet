import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { FC } from "react";

type Props = {
  width?: number;
  height?: number;
  progress: number;
  color?: string;
  backgroundColor?: string;
  label: string;
  value: number;
  goal: number;
  unit: string;
};

const ProgressBar: FC<Props> = ({
  width,
  height = scale(20),
  progress,
  color = colors["color-primary-500"],
  backgroundColor = colors["color-primary-100"] || "#e0e0e0",
  label,
  value,
  goal,
  unit = "",
}) => {
  // Calculate the percentage for styling
  const percentage = progress * 100;

  return (
    <View style={[styles.progressBarContainer, { width }]}>
      {/* Label (if provided) */}
      {label && (
        <Text style={[fontStyles.headline4, styles.label]}>{label}</Text>
      )}

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBackground,
          { height, backgroundColor, borderRadius: height / 2 },
        ]}
      >
        <View
          style={[
            styles.progressForeground,
            {
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>

      {/* Value display */}
      <View style={styles.valueContainer}>
        <Text style={fontStyles.body2}>
          {value}
          {unit} / {goal}
          {unit}
        </Text>
        <Text style={fontStyles.body2}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  progressBarContainer: {},
  label: {
    marginBottom: scale(5),
  },
  progressBackground: {
    // width: "100%",
    overflow: "hidden",
  },
  progressForeground: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: scale(5),
  },
});

export default ProgressBar;
