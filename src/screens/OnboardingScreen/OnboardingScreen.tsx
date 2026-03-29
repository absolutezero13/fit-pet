import { StyleSheet, Text, View } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { scale, SCREEN_WIDTH } from "../../theme/utils";
import AppButton from "../../components/AppButton";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { fontStyles } from "../../theme/fontStyles";
import Animated, { FadeInLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Age from "./components/Age";
import Analyzing from "./components/Analyzing";
import Goal from "./components/Goal";
import WeightHeight from "./components/WeightHeight";
import Gender from "./components/Gender";
import DietType from "./components/DietType";
import MealTimeSelection from "./components/MealTimeSelection";
import { useTheme } from "../../theme/ThemeContext";
import { analyticsService, AnalyticsEvent } from "../../services/analytics";

const OnboardingScreen = () => {
  const ref = useRef<FlatList>(null);
  const [step, setStep] = useState(0);
  const onboardingStore = useOnboardingStore();
  const { goBack } = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    analyticsService.logEvent(AnalyticsEvent.StartOnboarding);
  }, []);

  const onboardingItems = [
    {
      title: t("defineGoals"),
      component: Goal,
      disabled: onboardingStore.goals?.length === 0,
    },
    {
      title: t("identify"),
      component: Gender,
      disabled: !onboardingStore.gender,
    },
    {
      title: t("yourAge"),
      component: Age,
      disabled: onboardingStore.yearOfBirth === null,
    },
    {
      title: t("getPhysical"),
      component: WeightHeight,
      disabled:
        onboardingStore.weight === null || onboardingStore.height === null,
    },
    {
      title: t("dietTypesTitle"),
      component: DietType,
      disabled: onboardingStore.dietTypes?.length === 0,
    },
    {
      title: t("mealTimeTitle"),
      component: MealTimeSelection,
      disabled: false,
      skippable: true,
    },
    {
      title: "",
      component: Analyzing,
      standAlone: true,
    },
  ];

  const onButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    ref.current?.scrollToIndex({ index: step + 1, animated: true });
    setStep((prev) => prev + 1);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: onboardingItems[step].standAlone
            ? "transparent"
            : colors.background,
        },
      ]}
    >
      {onboardingItems[step]?.title ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: scale(24),
            marginTop: scale(24),
            paddingTop: insets.top,
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
              color={colors.text}
            />
          </Pressable>

          <Animated.Text
            layout={FadeInLeft}
            style={[
              fontStyles.headline1,
              {
                marginLeft: scale(16),
                color: colors.text,
              },
            ]}
          >
            {onboardingItems[step].title}
          </Animated.Text>
        </View>
      ) : null}

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
      {onboardingItems[step].title && (
        <View style={styles.buttonContainer}>
          <AppButton
            disableAnimation={false}
            position="bottom"
            title={t("proceed")}
            onPress={onButtonPress}
            margin={{ marginHorizontal: scale(24) }}
            disabled={onboardingItems[step].disabled}
          />
        </View>
      )}
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: "relative",
  },
  skipButton: {
    position: "absolute",
    top: scale(-40),
    right: scale(32),
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    zIndex: 1,
  },
  skipText: {
    ...fontStyles.body1,
    textDecorationLine: "underline",
  },
});
