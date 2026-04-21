import { Pressable, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import useOnboardingStore, {
  GenderEnum,
} from "../../../zustand/useOnboardingStore";

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
  const { colors, isDark } = useTheme();

  const renderItem = ({ item }: { item: GenderItem }) => {
    return (
      <Pressable
        onPress={() => useOnboardingStore.setState({ gender: item.key })}
        style={{
          backgroundColor:
            item.key === gender
              ? isDark
                ? colors["color-success-600"]
                : colors["color-primary-200"]
              : colors["color-primary-500"],
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
            color={
              item.key === gender
                ? colors["color-primary-500"]
                : colors["color-primary-100"]
            }
          />
        </View>
        <Text
          style={[
            fontStyles.headline2,
            {
              textAlign: "center",
              marginTop: scale(8),
              color:
                item.key === gender
                  ? colors["color-primary-500"]
                  : colors["color-primary-100"],
            },
          ]}
        >
          {t(item.titleKey)}
        </Text>

        {item.key === gender && (
          <FontAwesome6
            name="circle-check"
            size={scale(24)}
            color={colors["color-primary-500"]}
            style={{
              position: "absolute",
              top: scale(16),
              right: scale(16),
            }}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: scale(24),
        marginTop: scale(48),
        justifyContent: "center",
      }}
    >
      <FlatList
        data={genders}
        renderItem={renderItem}
        keyExtractor={(item) => item.titleKey}
        bounces={false}
        ItemSeparatorComponent={() => <View style={{ height: scale(16) }} />}
      />
    </View>
  );
};

export default Gender;
