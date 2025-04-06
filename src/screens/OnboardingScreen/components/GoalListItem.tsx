import React, { FC, useEffect } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";

export type GoalItem = {
  titleKey: string;
  key: string;
  iconComponent: ({ color }: { color?: string }) => JSX.Element;
};

type Props = {
  item: GoalItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
};

const GoalListItem: FC<Props> = ({ item, index, isSelected, onSelect }) => {
  const Icon = item.iconComponent;
  const { t } = useTranslation();
  const opacity = useSharedValue(0);

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
      })
    );
  }, []);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isSelected]);

  return (
    <Animated.View
      key={item.key}
      style={[
        {
          backgroundColor: isSelected
            ? colors["color-success-800"]
            : colors["color-primary-100"],
          borderRadius: scale(8),
        },
        animatedStyles,
        shadowStyle,
      ]}
    >
      {isSelected ? (
        <FontAwesome6
          name="check"
          size={scale(24)}
          color={colors["color-primary-100"]}
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
                ? colors["color-primary-100"]
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
                  ? colors["color-primary-100"]
                  : colors["color-primary-500"],
              },
            ]}
          >
            {t(item.titleKey)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default GoalListItem;
