import React, { FC, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { IMeal } from "../../../services/apiTypes";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { useTranslation } from "react-i18next";
import { deleteMeal } from "../../../services/mealAnalysis";
import useMealsStore from "../../../zustand/useMealsStore";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SwipeableRef } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable/ReanimatedSwipeable";

const renderRightActions = (
  prog: SharedValue<number>,
  drag: SharedValue<number>,
  handleDelete: () => void
) => {
  const styleAnimation = useAnimatedStyle(() => {
    console.log("showRightProgress:", prog.value);
    console.log("appliedTranslation:", drag.value);

    return {
      transform: [{ translateX: drag.value + 80 }],
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
          size={scale(24)}
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
  const swipeableRef = useRef<SwipeableRef>(null);

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
      <LiquidGlassView effect="clear" interactive style={styles.mealItem}>
        <TouchableOpacity
          activeOpacity={1}
          key={meal.description}
          style={styles.liquid}
          onPress={() => onPress(meal)}
        >
          <View style={styles.mealItemLeft}>
            <Text style={styles.mealItemTitle}>
              {meal.emoji} {meal.description}
            </Text>
          </View>

          <View style={styles.mealItemRight}>
            <Text style={styles.caloriesText}>{meal.calories} kcal</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={scale(24)}
              color={colors["color-primary-300"]}
            />
          </View>
        </TouchableOpacity>
      </LiquidGlassView>
    </Swipeable>
  );
};

export default SwipeableMealCard;

const styles = StyleSheet.create({
  liquid: {
    flexDirection: "row",
    flex: 1,
  },
  mealItem: {
    backgroundColor: "white",
    borderRadius: scale(28),
    marginBottom: scale(12),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
    overflow: "hidden",
    flexDirection: "row",
    padding: scale(16),
  },
  mealItemDetails: {
    padding: scale(16),
  },
  mealItemLeft: {
    flex: 1,
    flexDirection: "row",
  },
  mealItemTitle: {
    ...fontStyles.body1Bold,
  },
  mealItemTime: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  mealItemRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  caloriesText: {
    ...fontStyles.body1,
    color: colors["color-success-400"],
    marginRight: scale(2),
  },
  deleteButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: scale(80),
    marginBottom: scale(12),
  },
  deleteButton: {
    backgroundColor: colors["color-danger-500"],
    justifyContent: "center",
    alignItems: "center",
    width: scale(60),
    height: "100%",
    borderRadius: scale(16),
  },
});
