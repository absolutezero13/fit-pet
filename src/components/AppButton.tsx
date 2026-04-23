import React, { FC } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { useTheme } from "../theme/ThemeContext";
import GlassView from "./SafeGlassView";

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
  flex?: boolean;
}

const BOUNCE_IN = { damping: 16, stiffness: 520, mass: 0.35 };
const BOUNCE_OUT = { damping: 14, stiffness: 380, mass: 0.45 };

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
  flex = false,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const bounceScale = useSharedValue(1);

  const buttonBackgroundColor = backgroundColor ?? colors["color-primary-500"];
  const buttonTextColor = color ?? colors.textInverse;

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  const androidBounceable = Platform.OS === "android" && !disableAnimation;

  const onPressIn = () => {
    if (!androidBounceable || disabled || loading) return;
    bounceScale.value = withSpring(0.96, BOUNCE_IN);
  };

  const onPressOut = () => {
    if (!androidBounceable) return;
    bounceScale.value = withSpring(1, BOUNCE_OUT);
  };

  const outerStyle = [
    { borderRadius: scale(32) },
    ...(margin ? [margin] : []),
    { flex: flex ? 1 : undefined },
  ];

  const touchable = (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
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
        <Text style={[fontStyles.headline4, { color: buttonTextColor }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  const core = androidBounceable ? (
    <Animated.View
      style={[
        bounceStyle,
        {
          borderRadius: scale(32),
          overflow: "hidden",
          flex: flex ? 1 : undefined,
          alignSelf: flex ? undefined : "stretch",
        },
      ]}
    >
      {touchable}
    </Animated.View>
  ) : (
    touchable
  );

  const renderButton = () =>
    isLiquidGlassSupported ? (
      <GlassView effect="clear" interactive style={outerStyle}>
        {core}
      </GlassView>
    ) : (
      <View style={outerStyle}>{core}</View>
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
