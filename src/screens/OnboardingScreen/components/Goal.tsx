import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GoalListItem, { GoalItem } from "./GoalListItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import useOnboardingStore, {
  GoalEnum,
} from "../../../zustand/useOnboardingStore";

export const goalItems: GoalItem[] = [
  {
    titleKey: "loseWeight",
    key: GoalEnum.LoseWeight,
    iconComponent: ({ color }) => (
      <FontAwesome6
        name="weight-scale"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "gainMuscle",
    key: GoalEnum.GainMuscle,
    iconComponent: ({ color }) => (
      <FontAwesome6
        name="dumbbell"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "eatHealthier",
    key: GoalEnum.EatHealthier,
    iconComponent: ({ color }) => (
      <MaterialCommunityIcons
        name="food-apple"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "getMoreSleep",
    key: GoalEnum.GetMoreSleep,
    iconComponent: ({ color }) => (
      <FontAwesome6
        name="bed"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "drinkMoreWater",
    key: GoalEnum.DrinkMoreWater,
    iconComponent: ({ color }) => (
      <MaterialCommunityIcons
        name="water"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "reduceStress",
    key: GoalEnum.ReduceStress,
    iconComponent: ({ color }) => (
      <FontAwesome6
        name="spa"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "reduceAlcohol",
    key: GoalEnum.ReduceAlcohol,
    iconComponent: ({ color }) => (
      <MaterialCommunityIcons
        name="beer-outline"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "getMoreActive",
    key: GoalEnum.GetMoreActive,
    iconComponent: ({ color }) => (
      <MaterialCommunityIcons
        name="run-fast"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
];

const Goal = () => {
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const selectedGoals = useOnboardingStore((state) => state.goals);
  const renderItem = ({ item, index }: { item: GoalItem; index: number }) => {
    const isSelected = selectedGoals?.find((goal) => goal === item.key);

    const onSelect = () => {
      if (isSelected) {
        useOnboardingStore.setState({
          goals: selectedGoals?.filter((goal) => goal !== item.key),
        });
        return;
      }

      useOnboardingStore.setState({
        goals: [...selectedGoals, item.key],
      });
    };
    return (
      <GoalListItem
        onSelect={onSelect}
        item={item}
        index={index}
        isSelected={!!isSelected}
      />
    );
  };
  return (
    <View style={{ paddingHorizontal: scale(0), flex: 1 }}>
      <FlatList
        bounces={false}
        data={goalItems}
        numColumns={2}
        columnWrapperStyle={{ gap: scale(12), marginTop: scale(16) }}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        getItemLayout={(_, index) => ({
          length: scale(120),
          offset: scale(120) * index,
          index,
        })}
        contentContainerStyle={{
          paddingBottom: bottom + scale(100),
          paddingHorizontal: scale(24),
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Goal;
