import React, { FC, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Pressable,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import FastImage from "react-native-fast-image";
import { lightColors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { IMeal } from "../../../services/apiTypes";
import { useTranslation } from "react-i18next";
import getMacroConfig, {
  MacroType,
  withMacroAlpha,
} from "../../../utils/getMacroConfig";
import { deleteMeal } from "../../../services/mealAnalysis";
import { eventBus, AppEvent } from "../../../services/EventBus";
import useMealsStore from "../../../zustand/useMealsStore";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import getScoreColor from "../../../utils/getScoreColor";

const renderRightActions = (
  prog: SharedValue<number>,
  drag: SharedValue<number>,
  handleDelete: () => void,
) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 70 }],
    };
  });

  return (
    <Animated.View style={[styles.deleteButtonContainer, styleAnimation]}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={scale(22)}
          color={lightColors.textInverse}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const MacroBadge: FC<{
  type: MacroType;
  value: string;
}> = ({ type, value }) => {
  const config = getMacroConfig(type);
  return (
    <View
      style={[
        styles.macroBadge,
        { backgroundColor: withMacroAlpha(type, "10") },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={scale(12)}
        color={config.color}
      />
      <Text style={[styles.macroText, { color: config.color }]}>{value}</Text>
    </View>
  );
};

interface Props {
  meal: IMeal;
  onPress: (meal: IMeal) => void;
}

const SwipeableMealCard: FC<Props> = ({ meal, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const swipeableRef = useRef<any>(null);
  const scoreColor = getScoreColor(meal.score || 0, colors);

  const handleDelete = () => {
    Alert.alert(t("deleteConfirmation"), t("deleteItemConfirmationMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
        onPress: () => {
          swipeableRef.current?.close();
        },
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            useMealsStore.setState((state) => {
              const newMeals = state.loggedMeals.filter(
                (m) => m.id !== meal.id,
              );
              if (!meal.id) return state;

              return { loggedMeals: newMeals };
            });
            await deleteMeal(meal?.id ?? "");
            eventBus.publish(AppEvent.MealChanged, { date: meal.date });
          } catch (error) {
            console.error("Error deleting meal:", error);
            Alert.alert(t("error"), t("deleteFailed"));
          }
        },
      },
    ]);
  };

  return (
    <Swipeable
      overshootRight={false}
      friction={2}
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, handleDelete)
      }
      ref={swipeableRef}
    >
      <Pressable
        style={[styles.container, { backgroundColor: colors.surface }]}
        onPress={() => onPress(meal)}
      >
        {meal.image ? (
          <FastImage source={{ uri: meal.image }} style={styles.mealImage} />
        ) : (
          <View
            style={[
              styles.emojiContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={styles.emoji}>{meal.emoji}</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text
            style={[styles.description, { color: colors.text }]}
            numberOfLines={1}
          >
            {meal.description}
          </Text>
          <View style={styles.macrosRow}>
            <MacroBadge type="calories" value={`${meal.calories}`} />
            <MacroBadge type="protein" value={`${meal.proteins}g`} />
          </View>
        </View>
        <View style={styles.rightSection}>
          {meal.score > 0 && (
            <View
              style={[
                styles.scoreBadge,
                { backgroundColor: scoreColor + "15" },
              ]}
            >
              <MaterialCommunityIcons
                name="star"
                size={scale(12)}
                color={scoreColor}
              />
              <Text style={[styles.scoreText, { color: scoreColor }]}>
                {meal.score.toFixed(1)}
              </Text>
            </View>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={scale(20)}
            color={colors.textTertiary}
          />
        </View>
      </Pressable>
    </Swipeable>
  );
};

export default SwipeableMealCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(20),
    marginBottom: scale(10),
    padding: scale(14),
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: scale(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(14),
    elevation: 6,
  },
  emojiContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  mealImage: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    marginRight: scale(12),
  },
  emoji: {
    fontSize: scale(22),
  },
  content: {
    flex: 1,
    marginRight: scale(8),
  },
  description: {
    ...fontStyles.body1,
    fontWeight: "600",
    marginBottom: scale(4),
  },
  macrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  macroBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(8),
    gap: scale(3),
  },
  macroText: {
    ...fontStyles.caption,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(10),
    gap: scale(3),
  },
  scoreText: {
    ...fontStyles.caption,
    fontWeight: "700",
  },
  deleteButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: scale(70),
    marginBottom: scale(10),
  },
  deleteButton: {
    backgroundColor: lightColors["color-danger-500"],
    justifyContent: "center",
    alignItems: "center",
    width: scale(56),
    height: "100%",
    borderRadius: scale(16),
  },
});
