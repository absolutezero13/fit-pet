import { Image, Text, View } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { scale } from "../../theme/utils";
import MaleImage from "../assets/male.jpg";
import FemaleImage from "../assets/female.jpg";
import NonBinaryImage from "../assets/nonbinary.jpg";
import { FontAwesome6 } from "@expo/vector-icons";
import { Gender as GenderEnum } from "./types";

const genders = [
  {
    title: "Male",
    key: GenderEnum.Male,
    image: MaleImage,
  },

  {
    title: "Female",
    key: GenderEnum.Female,
    image: FemaleImage,
  },
  {
    title: "Non-binary",
    key: GenderEnum.Nonbinary,
    image: NonBinaryImage,
  },
];

const Gender = () => {
  const gender = useOnboardingStore((state) => state.gender);

  const renderItem = ({ item }) => {
    return (
      <Pressable
        onPress={() => useOnboardingStore.setState({ gender: item.key })}
        style={{
          backgroundColor:
            item.key === gender
              ? colors["color-primary-500"]
              : colors["color-primary-100"],
          flexDirection: "row",
          height: scale(100),
          borderRadius: scale(16),
          alignItems: "center",
        }}
      >
        <Image
          source={item.image}
          style={{
            width: scale(100),
            height: scale(100),
            borderRadius: scale(16),
            marginRight: scale(32),
          }}
        />
        <Text
          style={[
            fontStyles.headline2,
            {
              textAlign: "center",
              marginTop: scale(8),
              color:
                item.key === gender
                  ? colors["color-primary-100"]
                  : colors["color-primary-500"],
            },
          ]}
        >
          {item.title}
        </Text>

        <FontAwesome6
          name="circle-check"
          size={scale(24)}
          color={colors["color-primary-100"]}
          style={{
            position: "absolute",
            top: scale(16),
            right: scale(16),
          }}
        />
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
        keyExtractor={(item) => item.title}
        bounces={false}
        ItemSeparatorComponent={() => <View style={{ height: scale(16) }} />}
      />
    </View>
  );
};

export default Gender;
