import React, { FC, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { IMeal } from "../../../services/apiTypes";
import { useTranslation } from "react-i18next";
import { deleteMeal } from "../../../services/mealAnalysis";
import useMealsStore from "../../../zustand/useMealsStore";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const getScoreColor = (score: number) => {
  if (score >= 8) return "#4CAF50";
  if (score >= 6) return "#F5A623";
  if (score >= 4) return "#2196F3";
  return "#E53935";
};

const renderRightActions = (
  prog: SharedValue<number>,
  drag: SharedValue<number>,
  handleDelete: () => void
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
          color="white"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

interface Props {
  meal: IMeal;
  onPress: (meal: IMeal) => void;
}

const SwipeableMealCard: FC<Props> = ({ meal, onPress }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swipeableRef = useRef<any>(null);
  const scoreColor = getScoreColor(meal.score || 0);

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
                (m) => m._id !== meal._id
              );
              if (!meal._id) return state;

              deleteMeal(meal._id);
              return { loggedMeals: newMeals };
            });
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
      <TouchableOpacity style={styles.container} onPress={() => onPress(meal)}>
        {/* Emoji Container */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{meal.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={1}>
            {meal.description}
          </Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroBadge}>
              <MaterialCommunityIcons
                name="fire"
                size={scale(12)}
                color="#F5A623"
              />
              <Text style={styles.macroText}>{meal.calories}</Text>
            </View>
            <View style={[styles.macroBadge, styles.proteinBadge]}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={scale(12)}
                color="#4CAF50"
              />
              <Text style={[styles.macroText, styles.proteinText]}>
                {meal.proteins}g
              </Text>
            </View>
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
            color="#CCCCCC"
          />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default SwipeableMealCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: scale(20),
    marginBottom: scale(10),
    padding: scale(14),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.06,
    shadowRadius: scale(8),
    elevation: 3,
    marginHorizontal: scale(24),
  },
  emojiContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#1A1A1A",
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
    backgroundColor: "#FFF8E7",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(8),
    gap: scale(3),
  },
  proteinBadge: {
    backgroundColor: "#F0F9F0",
  },
  macroText: {
    ...fontStyles.caption,
    fontWeight: "600",
    color: "#F5A623",
  },
  proteinText: {
    color: "#4CAF50",
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
    backgroundColor: colors["color-danger-500"],
    justifyContent: "center",
    alignItems: "center",
    width: scale(56),
    height: "100%",
    borderRadius: scale(16),
  },
});
