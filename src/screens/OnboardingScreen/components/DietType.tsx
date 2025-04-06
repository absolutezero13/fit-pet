import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import GoalListItem from "./GoalListItem";

export const dietTypeItems: any[] = [
  {
    titleKey: "dietRegular",
    key: "1",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietVegetarian",
    key: "2",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="food-apple-outline"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietVegan",
    key: "3",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="leaf"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietPescatarian",
    key: "4",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="fish"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietFlexitarian",
    key: "5",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="food-variant"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietKeto",
    key: "6",
    iconComponent: ({ color }: { color?: string }) => (
      <FontAwesome6
        name="bacon"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietLowCarb",
    key: "7",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="bread-slice-outline"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietIntermittentFasting",
    key: "8",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="clock-outline"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietPaleo",
    key: "9",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="bone"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
  {
    titleKey: "dietWestern",
    key: "10",
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="hamburger"
        size={scale(24)}
        color={color ?? colors["color-primary-500"]}
      />
    ),
  },
];

const DietType = () => {
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const selectedDietTypes = useOnboardingStore(
    (state) => state?.dietTypes || []
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedDietTypes?.find((diet) => diet.key === item.key);

    const onSelect = () => {
      if (isSelected) {
        useOnboardingStore.setState({
          dietTypes: selectedDietTypes?.filter((diet) => diet.key !== item.key),
        });
        return;
      }

      useOnboardingStore.setState({
        dietTypes: [
          ...selectedDietTypes,
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
        data={dietTypeItems}
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

export default DietType;
