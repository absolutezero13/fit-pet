import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { scale } from "../../theme/utils";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../theme/colors";
import { GoalListItem } from "./GoalListItem";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

type GoalItem = {
  titleKey: string;
  key: string;
  iconComponent: ({ color }: { color?: string }) => JSX.Element;
};

export const goalItems: GoalItem[] = [
  {
    titleKey: "loseWeight",
    key: "1",
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
    key: "2",
    iconComponent: ({ color }) => (
      <FontAwesome6
        name="dumbbell"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "eatHeathier",
    key: "3",
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
    key: "4",
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
    key: "5",
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
    key: "6",
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
    key: "7",
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
    key: "8",
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
    const isSelected = selectedGoals?.find((goal) => goal.key === item.key);

    const onSelect = () => {
      if (isSelected) {
        useOnboardingStore.setState({
          goals: selectedGoals?.filter((goal) => goal.key !== item.key),
        });
        return;
      }

      useOnboardingStore.setState({
        goals: [
          ...selectedGoals,
          {
            key: item.key,
            title: t(item.titleKey),
          },
        ],
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
    <View style={{ paddingHorizontal: scale(24), flex: 1 }}>
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
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Goal;
