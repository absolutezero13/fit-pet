import React, { FC } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  margin?: {
    marginVertical?: number;
    marginHorizontal?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
  };

  position?: "bottom" | "top";
  disabled?: boolean;
  disableAnimation?: boolean;
  loading?: boolean;
  color?: string;
}

const AppButton: FC<Props> = ({
  title,
  onPress,
  backgroundColor,
  margin,
  position,
  disabled,
  disableAnimation = false,
  loading,
  color,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  const buttonBackgroundColor = backgroundColor ?? colors["color-primary-500"];
  const buttonTextColor = color ?? colors.textInverse;

  const renderButton = () => (
    <LiquidGlassView
      effect="clear"
      interactive
      style={[{ borderRadius: scale(32) }, margin]}
    >
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={1}
        style={[
          {
            backgroundColor: buttonBackgroundColor,
            padding: scale(16),
            borderRadius: scale(32),
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
            height: scale(56),
          },
        ]}
        onPress={onPress}
      >
        {loading ? (
          <ActivityIndicator color={buttonTextColor} />
        ) : (
          <Text style={[fontStyles.headline4, { color: buttonTextColor }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </LiquidGlassView>
  );

  if (disableAnimation) {
    return (
      <View
        style={{
          position: "absolute",
          bottom: bottom + scale(16),
          width: "100%",
        }}
      >
        {renderButton()}
      </View>
    );
  }

  if (position === "bottom") {
    return (
      <View
        style={{
          position: "absolute",
          bottom: bottom,
          width: "100%",
        }}
      >
        {renderButton()}
      </View>
    );
  }

  return renderButton();
};

export default AppButton;
