import React, { FC, useEffect } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, SCREEN_WIDTH } from "../../../theme/utils";
import { GoalEnum } from "../../../zustand/useOnboardingStore";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import GlassView from "../../../components/SafeGlassView";

export type GoalItem = {
  titleKey: string;
  key: GoalEnum;
  iconComponent: ({ color }: { color?: string }) => React.ReactNode;
};

type Props = {
  item: GoalItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
};

const AnimatedLiquidGlassView = Animated.createAnimatedComponent(GlassView);

const GoalListItem: FC<Props> = ({ item, index, isSelected, onSelect }) => {
  const Icon = item.iconComponent;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const opacity = useSharedValue(0.1);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    const delay = Math.floor(index / 2) * 200;
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 500,
      }),
    );
  }, []);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isSelected]);

  return (
    <AnimatedLiquidGlassView
      interactive
      effect="regular"
      key={item.key}
      tintColor={
        isSelected ? colors["color-success-800"] : colors["color-primary-100"]
      }
      style={[
        {
          borderRadius: scale(8),
          backgroundColor: isLiquidGlassSupported
            ? undefined
            : isSelected
              ? colors["color-success-600"]
              : colors["color-primary-300"],
        },
        animatedStyles,
      ]}
    >
      {isSelected ? (
        <FontAwesome6
          name="check"
          size={scale(24)}
          color={colors.white}
          style={{
            position: "absolute",
            top: scale(16),
            right: scale(16),
          }}
        />
      ) : null}
      <Pressable
        onPress={onSelect}
        style={{
          width: (SCREEN_WIDTH - scale(60)) / 2,
          height: scale(110),
          paddingHorizontal: scale(20),
          borderRadius: scale(8),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Icon
            color={
              isSelected
                ? colors.white
                : colors["color-primary-500"]
            }
          />
          <Text
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[
              fontStyles.headline3,
              {
                textAlign: "center",
                marginTop: scale(8),
                color: isSelected
                  ? colors.white
                  : colors["color-primary-500"],
              },
            ]}
          >
            {t(item.titleKey)}
          </Text>
        </View>
      </Pressable>
    </AnimatedLiquidGlassView>
  );
};

export default GoalListItem;
