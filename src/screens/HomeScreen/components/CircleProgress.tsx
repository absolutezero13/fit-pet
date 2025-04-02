import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";

type Props = {
  progress: number; // 0 to 1
  color?: string;
  label: string;
  value: string;
  goal: number;
  unit?: string;
  size?: number;
  strokeWidth?: number;
};

const CircleProgress: React.FC<Props> = ({
  progress,
  color = colors["color-primary-500"],
  label,
  value,
  goal,
  unit = "",
  size = scale(70),
  strokeWidth = scale(8),
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ alignItems: "center", marginHorizontal: scale(4) }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={colors["color-primary-100"]}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.valueContainer}>
        <Text
          style={[
            fontStyles.footnote,
            {
              textAlign: "center",
            },
          ]}
        >
          {value}
          {unit}
        </Text>
        <Text
          style={[
            fontStyles.footnote,
            {
              textAlign: "center",
            },
          ]}
        >
          /{goal}
          {unit}
        </Text>
      </View>
      <Text style={[fontStyles.body1, { marginTop: scale(4) }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  valueContainer: {
    position: "absolute",
    alignItems: "center",
    top: "30%",
  },
});

export default CircleProgress;
