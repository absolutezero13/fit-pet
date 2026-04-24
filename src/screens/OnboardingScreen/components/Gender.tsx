import { LayoutAnimation, Pressable, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import useOnboardingStore, {
  GenderEnum,
} from "../../../zustand/useOnboardingStore";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import GlassView from "../../../components/SafeGlassView";

type GenderItem = {
  titleKey: string;
  key: GenderEnum;
  icon: keyof typeof FontAwesome6.glyphMap;
};

const genders: GenderItem[] = [
  {
    titleKey: "male",
    key: GenderEnum.Male,
    icon: "mars",
  },
  {
    titleKey: "female",
    key: GenderEnum.Female,
    icon: "venus",
  },
  {
    titleKey: "nonBinary",
    key: GenderEnum.Other,
    icon: "venus-mars",
  },
];

const Gender = () => {
  const gender = useOnboardingStore((state) => state.gender);
  const { t } = useTranslation();
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: GenderItem }) => {
    const isSelected = item.key === gender;

    const onSelect = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      useOnboardingStore.setState({ gender: item.key });
    };

    return (
      <GlassView
        interactive
        effect="regular"
        tintColor={
          isSelected ? colors["color-success-800"] : colors["color-primary-100"]
        }
        style={{
          borderRadius: scale(16),
          backgroundColor: isLiquidGlassSupported
            ? undefined
            : isSelected
              ? colors["color-success-600"]
              : colors["color-primary-300"],
        }}
      >
        <Pressable
          onPress={onSelect}
          style={{
            flexDirection: "row",
            borderRadius: scale(16),
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: scale(100),
              height: scale(100),
              borderRadius: scale(16),
              marginRight: scale(32),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesome6
              name={item.icon}
              size={scale(48)}
              color={isSelected ? colors.white : colors["color-primary-500"]}
            />
          </View>
          <Text
            style={[
              fontStyles.headline2,
              {
                textAlign: "center",
                marginTop: scale(8),
                color: isSelected ? colors.white : colors["color-primary-500"],
              },
            ]}
          >
            {t(item.titleKey)}
          </Text>

          {isSelected && (
            <FontAwesome6
              name="circle-check"
              size={scale(24)}
              color={colors.white}
              style={{
                position: "absolute",
                top: scale(16),
                right: scale(16),
              }}
            />
          )}
        </Pressable>
      </GlassView>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <FlatList
        data={genders}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: scale(48),
          paddingHorizontal: scale(24),
        }}
        keyExtractor={(item) => item.titleKey}
        bounces={false}
        ItemSeparatorComponent={() => <View style={{ height: scale(16) }} />}
      />
    </View>
  );
};

export default Gender;
