import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState, useEffect } from "react";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { scale, SCREEN_HEIGHT } from "../../../theme/utils";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { lightColors } from "../../../theme/colors";
import AppButton from "../../../components/AppButton";
import AnalyzingMealOverlay from "../../../components/AnalyzingMealOverlay";
import { t } from "i18next";
import { LinearGradient } from "expo-linear-gradient";
import { createGeminiVisionCompletion } from "../../../services/gptApi";
import { IMeal } from "../../../services/apiTypes";
import {
  createMeal,
  updateMeal,
  uploadMealImageToFireStorage,
} from "../../../services/mealAnalysis";
import useMealsStore from "../../../zustand/useMealsStore";
import promptBuilder from "../../../utils/promptBuilder";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { useNavigation } from "@react-navigation/native";
import MealTypes from "./MealTypes";
import { TrueSheetNames } from "../../../navigation/constants";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from "react-native-reanimated";
import { fontStyles } from "../../../theme/fontStyles";
import { deleteMeal } from "../../../services/mealAnalysis";
import { syncMealLiveActivity } from "../../../services/mealLiveActivitySync";
import useUserStore from "../../../zustand/useUserStore";
import { getGramGoal } from "./utils";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { analyticsService, AnalyticsEvent } from "../../../services/analytics";
import { getLocalDateKey } from "../../../utils/dateUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MealScoreSection from "../../AnalyzedMealScreen/components/MealScoreSection";
import MealMacrosSection from "../../AnalyzedMealScreen/components/MealMacrosSection";
import MealInsightsSection from "../../AnalyzedMealScreen/components/MealInsightsSection";

type ScanMealTrueSheetProps = {
  params: {
    mealType?: string;
    selectedDate: string;
  };
};

type ScreenState = "camera" | "captured" | "analyzed";

// Animation timing constants
const ANIMATION_DISMISS_DELAY = 200;

const getPhotoUri = (path: string) =>
  path.startsWith("file://") ? path : `file://${path}`;

const ScanMealTrueSheet = (props: ScanMealTrueSheetProps) => {
  const { colors } = useTheme();
  const macroGoals = useUserStore((s) => s?.macroGoals);
  const proteinGoal = macroGoals
    ? getGramGoal({
        calorieGoal: macroGoals.calories,
        kcalCoefficent: 4,
        percentage: macroGoals.proteins,
      })
    : 0;
  const carbsGoal = macroGoals
    ? getGramGoal({
        calorieGoal: macroGoals.calories,
        kcalCoefficent: 4,
        percentage: macroGoals.carbs,
      })
    : 0;
  const fatsGoal = macroGoals
    ? getGramGoal({
        calorieGoal: macroGoals.calories,
        kcalCoefficent: 9,
        percentage: macroGoals.fats,
      })
    : 0;
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    // Keep the capture smaller so Android uploads stay under Vercel's body limit.
    { photoResolution: { width: 1280, height: 1280 } },
    { photoAspectRatio: 1 },
  ]);
  const cameraRef = useRef<Camera>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedMealType, setSelectedMealType] = useState<string>(
    t("breakfast"),
  );
  const [screenState, setScreenState] = useState<ScreenState>("camera");
  const [analyzedMeal, setAnalyzedMeal] = useState<IMeal | null>(null);
  const photoUri = photo ? getPhotoUri(photo.path) : null;
  const insets = useSafeAreaInsets();
  // Animation values
  const imageWidth = useSharedValue(100);
  const imageHeight = useSharedValue(scale(500));
  const imageMarginRight = useSharedValue(0);

  // Animated styles
  const animatedImageStyle = useAnimatedStyle(() => ({
    width: `${imageWidth.value}%`,
    height: imageHeight.value,
    marginRight: imageMarginRight.value,
  }));

  // Trigger animations when analysis completes
  useEffect(() => {
    if (screenState === "analyzed" && analyzedMeal) {
      // Shrink image and align left
      imageWidth.value = withSpring(40, {
        stiffness: 100,
        damping: 40,
      });
      imageHeight.value = withSpring(scale(150), {
        stiffness: 100,
        damping: 40,
      });
      imageMarginRight.value = withSpring(scale(16), {
        stiffness: 100,
        damping: 40,
      });
    }
  }, [screenState, analyzedMeal]);

  const dismiss = async () => {
    await TrueSheet.dismiss(TrueSheetNames.SCAN_MEAL);
  };

  const resetState = () => {
    setPhoto(null);
    setScreenState("camera");
    setAnalyzedMeal(null);
    setSelectedMealType(t("breakfast"));

    imageWidth.value = 100;
    imageHeight.value = scale(500);
    imageMarginRight.value = 0;
  };

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePhoto();
    setPhoto(photo ?? null);
    if (photo) {
      setScreenState("captured");
    }
  };

  const savePhoto = async () => {
    try {
      setLoading(true);
      const prompt = promptBuilder.createAnalysisPrompt(
        useOnboardingStore.getState(),
        "",
        selectedMealType,
      );
      const response = await createGeminiVisionCompletion(
        {
          uri: photoUri ?? "",
          mimeType: "image/jpeg",
        },
        prompt,
        "analyzedMeal",
      );

      const meal: IMeal = JSON.parse(
        response.response.candidates[0].content.parts[0].text,
      );

      meal.date = getLocalDateKey(props.params.selectedDate);
      meal.image = photo?.path ?? null;

      console.log("CREATING MEAL", meal);

      if (meal.errorMessage) {
        analyticsService.logEvent(AnalyticsEvent.MealLogError);
        Alert.alert("Error", meal.errorMessage);
        resetState();
        return;
      }

      const responseMeal = await createMeal(meal);
      meal.id = responseMeal.id;

      if (!meal.errorMessage) {
        const meals = useMealsStore.getState().loggedMeals;
        useMealsStore.setState({ loggedMeals: [...meals, meal] });
        if (meal.date) syncMealLiveActivity(meal.date);
      }

      analyticsService.logEvent(AnalyticsEvent.MealLogged, {
        type: "scan",
        description: meal.description ?? "",
      });

      setAnalyzedMeal(meal);
      setScreenState("analyzed");

      if (meal.image) {
        const imageUrl = await uploadMealImageToFireStorage(
          meal.image,
          meal.id ?? "",
          useUserStore.getState()?.uid ?? "",
        );
        console.log("IMAGE URL", imageUrl);
        meal.image = imageUrl;
      }
      updateMeal(meal);
    } catch (error) {
      console.log("ERROR SAVING PHOTO", error);
      analyticsService.logEvent(AnalyticsEvent.MealLogError);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to analyze meal",
      );
      resetState();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!analyzedMeal?.id) return;

    Alert.alert(t("deleteConfirmation"), t("deleteItemConfirmationMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            useMealsStore.setState((state) => {
              const newMeals = state.loggedMeals.filter(
                (m) => m.id !== analyzedMeal.id,
              );
              if (analyzedMeal.id) {
                deleteMeal(analyzedMeal.id);
              }
              return { loggedMeals: newMeals };
            });
            if (analyzedMeal.date) syncMealLiveActivity(analyzedMeal.date);
            dismiss();
            setTimeout(resetState, ANIMATION_DISMISS_DELAY);
          } catch (error) {
            console.error("Error deleting meal:", error);
            Alert.alert(t("error"), t("deleteFailed"));
          }
        },
      },
    ]);
  };

  const handleNewScan = () => {
    resetState();
  };

  const cameraHeightAndroid = SCREEN_HEIGHT - insets.top;
  return (
    <TrueSheet
      backgroundColor={colors.surface}
      dismissible={!loading}
      scrollable
      onDidDismiss={() => {
        setTimeout(() => {
          resetState();
        }, 100);
      }}
      name={TrueSheetNames.SCAN_MEAL}
      detents={["auto"]}
      insetAdjustment="never"
      blurOptions={{
        interaction: false,
      }}
    >
      {screenState === "camera" && device && (
        <View style={styles.cameraContainer}>
          <Camera
            photo={true}
            ref={cameraRef}
            device={device}
            format={format}
            isActive={true}
            style={[
              styles.camera,
              {
                height: Platform.select({
                  default: scale(500),
                  android: cameraHeightAndroid,
                }),
              },
            ]}
            photoQualityBalance="speed"
          />
          <Pressable
            onPress={takePhoto}
            style={styles.takePhotoButton}
          ></Pressable>
        </View>
      )}

      {screenState === "captured" && photo && (
        <View style={styles.capturedContainer}>
          <View style={styles.capturedImageWrapper}>
            <Image
              source={{ uri: photoUri ?? "" }}
              style={styles.capturedPhoto}
            />
            <LinearGradient
              colors={["transparent", colors.background]}
              style={styles.capturedGradientOverlay}
            />
            <Pressable
              disabled={loading}
              onPress={handleNewScan}
              style={[
                styles.retakeButton,
                { backgroundColor: colors.surface, opacity: loading ? 0.5 : 1 },
              ]}
            >
              <MaterialCommunityIcons
                name="camera-retake"
                size={scale(20)}
                color={colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.capturedContentSection}>
            <Text style={[styles.capturedTitle, { color: colors.text }]}>
              {t("mealType")}
            </Text>

            <View style={styles.capturedMealTypeContainer}>
              <MealTypes
                selectedMealType={selectedMealType}
                setSelectedMealType={setSelectedMealType}
              />
            </View>

            <AppButton
              title={t("analyzeMeal")}
              onPress={savePhoto}
              disabled={loading}
              margin={{ marginTop: scale(16) }}
            />
          </View>
        </View>
      )}

      {screenState === "analyzed" && analyzedMeal && photo && (
        <ScrollView
          nestedScrollEnabled
          style={styles.analyzedContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.analyzedContent}
        >
          <Text style={[styles.analyzedTitle, { color: colors.text }]}>
            {t("mealAnalysis")}
          </Text>
          <View
            style={[styles.topSection, { backgroundColor: colors.surface }]}
          >
            <Animated.Image
              source={{ uri: photoUri ?? "" }}
              style={[styles.analyzedImage, animatedImageStyle]}
            />
            <Animated.View
              entering={FadeInUp.delay(300).duration(500)}
              style={styles.basicInfo}
            >
              <Text
                style={[styles.mealName, { color: colors.text }]}
                numberOfLines={3}
              >
                {analyzedMeal.description}
              </Text>
              <View
                style={[
                  styles.calorieContainer,
                  { backgroundColor: colors["color-danger-100"] },
                ]}
              >
                <MaterialCommunityIcons
                  name="fire"
                  size={scale(20)}
                  color={colors["color-danger-500"]}
                />
                <Text
                  style={[
                    styles.calorieValue,
                    { color: colors["color-danger-600"] },
                  ]}
                >
                  {analyzedMeal.calories}
                </Text>
                <Text
                  style={[
                    styles.calorieUnit,
                    { color: colors["color-danger-600"] },
                  ]}
                >
                  {t("cal")}
                </Text>
              </View>
            </Animated.View>
          </View>
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <MealScoreSection score={analyzedMeal.score} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500).duration(500)}>
            <MealMacrosSection
              proteins={analyzedMeal.proteins ?? 0}
              carbs={analyzedMeal.carbs ?? 0}
              fats={analyzedMeal.fats ?? 0}
              variant="remaining"
              proteinGoal={proteinGoal}
              carbsGoal={carbsGoal}
              fatsGoal={fatsGoal}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(500)}>
            <MealInsightsSection insights={analyzedMeal.insights} />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.actionContainer}
          >
            <LiquidGlassView
              effect="clear"
              interactive
              style={[
                styles.actionButtonPrimary,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButtonInner}
                onPress={handleNewScan}
              >
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={scale(22)}
                  color={colors["color-primary-600"]}
                />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {t("scanAnother")}
                </Text>
              </TouchableOpacity>
            </LiquidGlassView>

            <LiquidGlassView
              effect="clear"
              interactive
              style={[
                styles.actionButton,
                { backgroundColor: colors["color-danger-500"] },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButtonInner}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={scale(22)}
                  color={colors.textInverse}
                />
                <Text
                  style={[styles.actionText, { color: colors.textInverse }]}
                >
                  {t("delete")}
                </Text>
              </TouchableOpacity>
            </LiquidGlassView>
          </Animated.View>

          <View style={{ height: scale(40) }} />
        </ScrollView>
      )}
      <AnalyzingMealOverlay visible={loading} variant="dots" />
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  // Captured state styles
  capturedContainer: {
    flex: 1,
  },
  capturedImageWrapper: {
    position: "relative",
  },
  capturedPhoto: {
    height: Platform.select({ default: scale(380), android: scale(500) }),
    width: "100%",
    borderRadius: scale(24),
  },
  capturedGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(140),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  retakeButton: {
    position: "absolute",
    top: scale(16),
    right: scale(16),
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  capturedContentSection: {
    paddingHorizontal: scale(24),
    paddingTop: scale(16),
    paddingBottom: scale(32),
    justifyContent: "flex-end",
    flex: 1,
  },
  capturedTitle: {
    ...fontStyles.headline2,
    marginBottom: scale(6),
  },
  capturedSubtitle: {
    ...fontStyles.body2,
    textAlign: "center",
    marginBottom: scale(20),
  },
  capturedMealTypeContainer: {
    marginBottom: scale(8),
  },
  camera: {
    height: scale(500),
    width: "100%",
  },
  cameraContainer: {
    position: "relative",
  },
  takePhotoButton: {
    position: "absolute",
    bottom: scale(24),
    backgroundColor: lightColors["color-danger-500"],
    zIndex: 99,
    height: scale(80),
    width: scale(80),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 5,
    borderColor: lightColors["color-primary-100"],
  },
  analyzedContainer: {
    flex: 1,
  },
  analyzedTitle: {
    ...fontStyles.headline1,
    marginBottom: scale(12),
    textAlign: "center",
  },
  analyzedContent: {
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
  },
  topSection: {
    flexDirection: "row",
    marginBottom: scale(24),
    alignItems: "flex-start",
    borderRadius: scale(20),
    padding: scale(16),
  },
  analyzedImage: {
    borderRadius: scale(20),
    resizeMode: "cover",
  },
  basicInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  mealName: {
    ...fontStyles.headline2,
    marginBottom: scale(12),
    lineHeight: scale(28),
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    alignSelf: "flex-start",
  },
  calorieValue: {
    ...fontStyles.headline3,
    fontWeight: "700",
    marginLeft: scale(6),
  },
  calorieUnit: {
    ...fontStyles.body2,
    marginLeft: scale(2),
    fontWeight: "600",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(20),
    gap: scale(10),
  },
  actionButton: {
    flex: 1,
    borderRadius: scale(20),
    overflow: "hidden",
  },
  actionButtonPrimary: {
    flex: 1.5,
    borderRadius: scale(20),
    overflow: "hidden",
  },
  actionButtonInner: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(8),
    gap: scale(6),
  },
  actionText: {
    ...fontStyles.body1Bold,
    textAlign: "center",
  },
});

export default ScanMealTrueSheet;
