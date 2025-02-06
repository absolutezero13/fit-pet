import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { fontStyles } from "../../theme/fontStyles";
import { scale, SCREEN_WIDTH } from "../../theme/utils";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { colors } from "../../theme/colors";
import { GoalListItem } from "./GoalListItem";
import AppButton from "../../components/AppButton";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const goalItems = [
  {
    title: "Lose weight",
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
    title: "Gain muscle",
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
    title: "Eat healthier",
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
    title: "Get more sleep",
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
    title: "Drink more water",
    key: "6",
    iconComponent: ({ color }) => (
      <MaterialCommunityIcons
        name="water"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    title: "Reduce stress",
    key: "12",
    iconComponent: ({ color }) => (
      <FontAwesome6
        name="spa"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    title: "Reduce alcohol",
    key: "14",
    iconComponent: ({ color }) => (
      <MaterialCommunityIcons
        name="beer-outline"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    title: "Get more active",
    key: "15",
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
  const selectedGoals = useOnboardingStore((state) => state.goals);
  const renderItem = ({ item, index }) => {
    const isSelected = selectedGoals.find((goal) => goal.key === item.key);

    const onSelect = () => {
      if (isSelected) {
        useOnboardingStore.setState({
          goals: selectedGoals.filter((goal) => goal.key !== item.key),
        });
        return;
      }

      useOnboardingStore.setState({ goals: [...selectedGoals, item] });
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
        getItemLayout={(data, index) => ({
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
