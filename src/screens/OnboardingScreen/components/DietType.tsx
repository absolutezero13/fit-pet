import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { scale } from "../../../theme/utils";
import useOnboardingStore, {
  DietTypeEnum,
} from "../../../zustand/useOnboardingStore";
import GoalListItem from "./GoalListItem";
import { lightColors } from "../../../theme/colors";

export const dietTypeItems: any[] = [
  {
    titleKey: "dietRegular",
    key: DietTypeEnum.Regular,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietVegetarian",
    key: DietTypeEnum.Vegetarian,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="food-apple-outline"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietVegan",
    key: DietTypeEnum.Vegan,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="leaf"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietPescatarian",
    key: DietTypeEnum.Pescatarian,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="fish"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietFlexitarian",
    key: DietTypeEnum.Flexitarian,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="food-variant"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietKeto",
    key: DietTypeEnum.Keto,
    iconComponent: ({ color }: { color?: string }) => (
      <FontAwesome6
        name="bacon"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietLowCarb",
    key: DietTypeEnum.LowCarb,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="bread-slice-outline"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietIntermittentFasting",
    key: DietTypeEnum.IntermittentFasting,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="clock-outline"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietPaleo",
    key: DietTypeEnum.Paleo,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="bone"
        size={scale(24)}
        color={color ?? lightColors.text}
      />
    ),
  },
  {
    titleKey: "dietWestern",
    key: DietTypeEnum.Western,
    iconComponent: ({ color }: { color?: string }) => (
      <MaterialCommunityIcons
        name="hamburger"
        size={scale(24)}
        color={color ?? lightColors.text}
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
    const isSelected = selectedDietTypes?.find((diet) => diet === item.key);

    const onSelect = () => {
      if (isSelected) {
        useOnboardingStore.setState({
          dietTypes: selectedDietTypes?.filter((diet) => diet !== item.key),
        });
        return;
      }

      useOnboardingStore.setState({
        dietTypes: [...selectedDietTypes, item.key],
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
    <View style={{ flex: 1 }}>
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
          paddingHorizontal: scale(24),
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default DietType;
