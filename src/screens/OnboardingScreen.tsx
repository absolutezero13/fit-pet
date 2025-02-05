import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
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

const OnboardingScreen = () => {
  const ref = useRef<FlatList>(null);
  const [step, setStep] = useState(0);
  const onboardingStore = useOnboardingStore();

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
  ];

  const onButtonPress = () => {
    console.log("step", step);
    ref.current?.scrollToIndex({ index: step + 1, animated: true });
    setStep((prev) => prev + 1);
  };
  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text
        layout={FadeInLeft}
        style={[
          fontStyles.headline1,
          { marginHorizontal: scale(24), marginTop: scale(24) },
        ]}
      >
        {onboardingItems[step].title}
      </Animated.Text>
      <FlatList
        renderItem={({ item }) => {
          const Component = item.component;

          return (
            <View style={{ width: SCREEN_WIDTH }}>
              <Component />
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
