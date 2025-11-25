import React, { FC } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@callstack/liquid-glass";

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
}

const AppButton: FC<Props> = ({
  title,
  onPress,
  backgroundColor = colors["color-primary-500"],
  margin,
  position,
  disabled,
  disableAnimation = false,
  loading,
}) => {
  const { bottom } = useSafeAreaInsets();

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
            backgroundColor,
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
          <ActivityIndicator color="white" />
        ) : (
          <Text style={[fontStyles.headline4, { color: "white" }]}>
            {title}
          </Text>
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
