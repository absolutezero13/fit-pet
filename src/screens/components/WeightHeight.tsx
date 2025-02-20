import { Image, ImageSourcePropType, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { IS_SMALL_SCREEN, scale, SCREEN_WIDTH } from "../../theme/utils";
import { fontStyles } from "../../theme/fontStyles";
import { colors } from "../../theme/colors";
import femaleStandingPerson from "../assets/female-person-standing.png";
import maleStandingPerson from "../assets/male-person-standing.png";
import nonbinaryStandingPerson from "../assets/nonbinary-person-standing.png";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { Gender } from "./types";

const imageMapping: Record<Gender, ImageSourcePropType> = {
  [Gender.Female]: femaleStandingPerson,
  [Gender.Male]: maleStandingPerson,
  [Gender.Nonbinary]: nonbinaryStandingPerson,
};

const LIST_HEIGHT = IS_SMALL_SCREEN ? scale(300) : scale(400);

const heightData = Array.from({ length: 120 })
  .fill(0)
  .map((_, i) => i + 130);

const weightData = Array.from({ length: 160 })
  .fill(0)
  .map((_, i) => i + 40);

const WeightHeight = ({ focused }) => {
  const { height, weight } = useOnboardingStore();

  return (
    <View>
      <Image
        source={
          imageMapping[useOnboardingStore.getState().gender || Gender.Female]
        }
        style={{
          aspectRatio: 1 / 2,
          height: LIST_HEIGHT,
          resizeMode: "contain",
          alignSelf: "center",
          position: "absolute",
          top: scale(64),
        }}
      />
      <Animated.Text
        layout={FadeInDown}
        style={[
          fontStyles.headline1,
          {
            marginHorizontal: scale(24),
            marginTop: scale(24),
            alignSelf: "center",
          },
        ]}
      >
        {height} cm
      </Animated.Text>

      {focused && (
        <FlatList
          removeClippedSubviews
          initialNumToRender={20}
          initialScrollIndex={20}
          bounces={false}
          data={heightData}
          keyExtractor={(item) => item.toString()}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.y / scale(20));
            if (heightData[index] !== height && heightData[index]) {
              console.log(heightData[index]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              useOnboardingStore.setState({ height: heightData[index] });
            }
          }}
          getItemLayout={(data, index) => ({
            length: scale(40),
            offset: scale(40) * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          style={{
            height: LIST_HEIGHT,
          }}
          renderItem={({ item, index }) => (
            <View
              style={{
                height: index % 5 === 0 ? scale(4) : scale(2),
                width: index % 5 === 0 ? scale(50) : scale(25),
                marginTop: scale(20),
                backgroundColor: colors["color-primary-900"],
                alignSelf: "flex-end",
              }}
            />
          )}
        />
      )}
      <Text
        style={[
          fontStyles.headline1,
          {
            marginHorizontal: scale(24),
            marginTop: scale(24),
            alignSelf: "center",
          },
        ]}
      >
        {weight} kg
      </Text>

      {focused && (
        <FlatList
          removeClippedSubviews
          initialNumToRender={30}
          data={weightData}
          keyExtractor={(item) => item.toString()}
          horizontal
          initialScrollIndex={25}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          getItemLayout={(data, index) => ({
            length: scale(6.2),
            offset: scale(6.2) * index,
            index,
          })}
          onScroll={(e) => {
            e.preventDefault();
            const index = Math.round(
              e.nativeEvent.contentOffset.x / scale(5.4)
            );
            if (weightData[index] !== weight && weightData[index]) {
              console.log(weightData[index]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              useOnboardingStore.setState({ weight: weightData[index] });
            }
          }}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_WIDTH / 2 - scale(24),
          }}
          renderItem={({ item, index }) => (
            <View
              style={{
                width: index % 5 === 0 ? scale(2) : scale(1),
                height: index % 5 === 0 ? scale(30) : scale(15),
                marginLeft: scale(5),
                backgroundColor: colors["color-primary-900"],
                alignSelf: "flex-end",
              }}
            />
          )}
        />
      )}
    </View>
  );
};

export default WeightHeight;
