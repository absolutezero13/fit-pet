import { StyleSheet, Text, View } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Goal from "./components/Goal";
import { useRef, useState } from "react";
import { colors } from "../theme/colors";
import { scale, SCREEN_WIDTH } from "../theme/utils";
import AppButton from "../components/AppButton";
import useOnboardingStore from "../zustand/useOnboardingStore";
import { fontStyles } from "../theme/fontStyles";
import Animated, { FadeInLeft } from "react-native-reanimated";
import Gender from "./components/Gender";
import Age from "./components/Age";
import WeightHeight from "./components/WeightHeight";
import * as Haptics from "expo-haptics";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";

const OnboardingScreen = () => {
  const ref = useRef<FlatList>(null);
  const [step, setStep] = useState(0);
  const onboardingStore = useOnboardingStore();
  const { goBack } = useNavigation();

  const onboardingItems = [
    {
      title: "First, let's define our goals.",
      component: Goal,
      disabled: onboardingStore.goals.length === 0,
    },
    {
      title: "How do you identify?",
      component: Gender,
      disabled: onboardingStore.gender === "",
    },
    {
      title: "Tell us your age",
      component: Age,
      disabled: onboardingStore.age === null,
    },
    {
      title: "Let's get physical",
      component: WeightHeight,
      disabled:
        onboardingStore.weight === null || onboardingStore.height === null,
    },
  ];

  const onButtonPress = () => {
    console.log("step", step);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ref.current?.scrollToIndex({ index: step + 1, animated: true });
    setStep((prev) => prev + 1);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: scale(24),
          marginTop: scale(24),
        }}
      >
        <Pressable
          hitSlop={scale(10)}
          onPress={() => {
            if (step === 0) {
              goBack();
              return;
            }
            ref.current?.scrollToIndex({ index: step - 1, animated: true });
            setStep((prev) => prev - 1);
          }}
        >
          <FontAwesome6
            name="chevron-left"
            size={scale(20)}
            color={colors["color-primary-500"]}
          />
        </Pressable>

        <Animated.Text
          layout={FadeInLeft}
          style={[
            fontStyles.headline1,
            {
              marginLeft: scale(16),
            },
          ]}
        >
          {onboardingItems[step].title}
        </Animated.Text>
      </View>

      <FlatList
        renderItem={({ item }) => {
          const Component = item.component;

          return (
            <View style={{ width: SCREEN_WIDTH }}>
              <Component
                focused={
                  step ===
                  onboardingItems.findIndex((i) => i.title === item.title)
                }
              />
            </View>
          );
        }}
        data={onboardingItems}
        keyExtractor={(item) => item.title}
        horizontal
        scrollEnabled={false}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={ref}
      />

      <AppButton
        margin={{ marginHorizontal: scale(24) }}
        title="Proceed"
        position="bottom"
        onPress={onButtonPress}
        disabled={onboardingItems[step].disabled}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-200"],
  },
});
