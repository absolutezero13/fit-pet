import React, { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

import { colors } from "../theme/colors";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
}

const AppButton: FC<Props> = ({
  title,
  onPress,
  backgroundColor = colors["color-primary-500"],
  margin,
  position,
  disabled,
  disableAnimation = false,
}) => {
  const { bottom } = useSafeAreaInsets();

  const renderButton = () => (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.9}
      style={[
        margin,
        {
          backgroundColor,
          padding: scale(16),
          borderRadius: scale(32),
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[fontStyles.headline4, { color: "white" }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (position === "bottom") {
    return (
      <Animated.View
        style={{
          position: "absolute",
          bottom: bottom + scale(16),
          width: "100%",
        }}
        entering={disableAnimation ? undefined : FadeInDown.delay(500)}
      >
        {renderButton()}
      </Animated.View>
    );
  }

  return renderButton();
};

export default AppButton;
