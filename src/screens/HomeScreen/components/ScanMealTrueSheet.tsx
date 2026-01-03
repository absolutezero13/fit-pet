import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState, useEffect } from "react";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { scale } from "../../../theme/utils";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../../components/AppButton";
import { t } from "i18next";
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
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInUp,
} from "react-native-reanimated";
import { fontStyles } from "../../../theme/fontStyles";
import { deleteMeal } from "../../../services/mealAnalysis";
import useUserStore from "../../../zustand/useUserStore";
import { LiquidGlassView } from "@callstack/liquid-glass";

type ScanMealTrueSheetProps = {
  params: {
    mealType?: string;
    selectedDate: string;
  };
};

type ScreenState = "camera" | "captured" | "analyzing" | "analyzed";

// Animation timing constants
const ANIMATION_DISMISS_DELAY = 200;

const ScanMealTrueSheet = (props: ScanMealTrueSheetProps) => {
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [{ photoAspectRatio: 1 }]);
  const cameraRef = useRef<Camera>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedMealType, setSelectedMealType] = useState<string>(
    t("breakfast")
  );
  const [screenState, setScreenState] = useState<ScreenState>("camera");
  const [analyzedMeal, setAnalyzedMeal] = useState<IMeal | null>(null);

  // Animation values
  const imageWidth = useSharedValue(100);
  const imageHeight = useSharedValue(scale(500));
  const imageMarginRight = useSharedValue(0);

  // Analyzing loader animations
  const loaderRotation = useSharedValue(0);
  const loaderPulse = useSharedValue(1);

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

  // Trigger loader animations when analyzing
  useEffect(() => {
    if (screenState === "analyzing") {
      loaderRotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1
      );
      loaderPulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      loaderRotation.value = 0;
      loaderPulse.value = 1;
    }
  }, [screenState]);

  // Animated styles for loader
  const loaderRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loaderRotation.value}deg` }],
  }));

  const loaderPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loaderPulse.value }],
  }));

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
      setScreenState("analyzing");
      const prompt = promptBuilder.createAnalysisPrompt(
        useOnboardingStore.getState(),
        "",
        selectedMealType,
        new Date(props.params.selectedDate).toLocaleDateString("en-US")
      );
      const response = await createGeminiVisionCompletion(
        {
          uri: photo?.path ?? "",
          mimeType: "image/jpeg",
        },
        prompt,
        "analyzedMeal"
      );

      const meal: IMeal = JSON.parse(
        response.response.candidates[0].content.parts[0].text
      );

      meal.date = new Date(props.params.selectedDate).toISOString();
      meal.image = photo?.path ?? null;

      console.log("CREATING MEAL", meal);

      if (meal.errorMessage) {
        Alert.alert("Error", meal.errorMessage);
        resetState();
        return;
      }

      const responseMeal = await createMeal(meal);
      meal._id = responseMeal._id;

      if (!meal.errorMessage) {
        const meals = useMealsStore.getState().loggedMeals;
        useMealsStore.setState({ loggedMeals: [...meals, meal] });
      }

      setAnalyzedMeal(meal);
      setScreenState("analyzed");

      if (meal.image) {
        const imageUrl = await uploadMealImageToFireStorage(
          meal.image,
          meal._id ?? "",
          useUserStore.getState()?.uid ?? ""
        );
        console.log("IMAGE URL", imageUrl);
        meal.image = imageUrl;
      }
      updateMeal(meal);
    } catch (error) {
      console.log("ERROR SAVING PHOTO", error);
      Alert.alert("Error", "Failed to analyze meal");
      resetState();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!analyzedMeal?._id) return;

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
                (m) => m._id !== analyzedMeal._id
              );
              if (analyzedMeal._id) {
                deleteMeal(analyzedMeal._id);
              }
              return { loggedMeals: newMeals };
            });
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors["color-success-500"];
    if (score >= 6) return colors["color-warning-500"];
    return colors["color-danger-500"];
  };

  const getScoreLabel = (score: number) => {
    const roundedScore = Math.max(1, Math.min(10, Math.floor(score)));
    return t("score" + roundedScore);
  };

  const renderMacroIcon = (type: string) => {
    switch (type) {
      case "protein":
        return (
          <MaterialCommunityIcons
            name="food-steak"
            size={scale(20)}
            color={colors["color-primary-500"]}
          />
        );
      case "carbs":
        return (
          <MaterialCommunityIcons
            name="bread-slice"
            size={scale(20)}
            color={colors["color-info-500"]}
          />
        );
      case "fats":
        return (
          <MaterialCommunityIcons
            name="oil"
            size={scale(20)}
            color={colors["color-warning-500"]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <TrueSheet
      scrollable
      onDidDismiss={() => {
        setTimeout(() => {
          resetState();
        }, 100);
      }}
      name={TrueSheetNames.SCAN_MEAL}
      detents={["auto"]}
      blurTint="system-thick-material-light"
      insetAdjustment="never"
      blurOptions={{
        interaction: false,
      }}
    >
      {screenState === "camera" && device && (
        <>
          <Camera
            photo={true}
            ref={cameraRef}
            device={device}
            format={format}
            isActive={true}
            style={styles.camera}
            photoQualityBalance="speed"
          />
          <Pressable
            onPress={takePhoto}
            style={styles.takePhotoButton}
          ></Pressable>
        </>
      )}

      {screenState === "captured" && photo && (
        <>
          <View>
            <Image source={{ uri: photo.path }} style={styles.photo} />
            <Pressable
              onPress={handleNewScan}
              style={[
                styles.takePhotoButton,
                {
                  backgroundColor: colors["color-primary-500"],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={scale(24)}
                color="white"
              />
            </Pressable>
          </View>

          <AppButton
            title={t("analyzeMeal")}
            onPress={savePhoto}
            margin={{
              marginTop: scale(24),
              marginHorizontal: scale(24),
            }}
          />
          <View style={styles.mealTypeContainer}>
            <MealTypes
              selectedMealType={selectedMealType}
              setSelectedMealType={setSelectedMealType}
            />
          </View>
        </>
      )}

      {screenState === "analyzing" && photo && (
        <View style={styles.analyzingContainer}>
          <Image source={{ uri: photo.path }} style={styles.photo} />
          <View style={styles.analyzingOverlay}>
            <Animated.View
              style={[styles.loaderOuterRing, loaderRotationStyle]}
            >
              <Text style={styles.loaderEmoji}>🍕</Text>
              <Text style={[styles.loaderEmoji, styles.loaderEmoji2]}>🥗</Text>
              <Text style={[styles.loaderEmoji, styles.loaderEmoji3]}>🍎</Text>
              <Text style={[styles.loaderEmoji, styles.loaderEmoji4]}>🥑</Text>
            </Animated.View>
            <Animated.View
              style={[styles.loaderIconContainer, loaderPulseStyle]}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={scale(32)}
                color={colors["color-primary-50"]}
              />
            </Animated.View>
            <Text style={styles.analyzingText}>{t("analyzingMeal")}</Text>
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
          <Text style={styles.analyzedTitle}>{t("mealAnalysis")}</Text>
          <View style={styles.topSection}>
            <Animated.Image
              source={{ uri: photo.path }}
              style={[styles.analyzedImage, animatedImageStyle]}
            />
            <Animated.View
              entering={FadeInUp.delay(300).duration(500)}
              style={styles.basicInfo}
            >
              <Text style={styles.mealName} numberOfLines={3}>
                {analyzedMeal.description}
              </Text>
              <View style={styles.calorieContainer}>
                <MaterialCommunityIcons
                  name="fire"
                  size={scale(20)}
                  color={colors["color-danger-500"]}
                />
                <Text style={styles.calorieValue}>{analyzedMeal.calories}</Text>
                <Text style={styles.calorieUnit}>{t("cal")}</Text>
              </View>
            </Animated.View>
          </View>
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.scoreSection}
          >
            <View
              style={[
                styles.scoreContainer,
                { backgroundColor: getScoreColor(analyzedMeal.score) },
              ]}
            >
              <Text style={styles.scoreValue}>{analyzedMeal.score}</Text>
            </View>
            <View style={styles.scoreTextContainer}>
              <Text style={styles.scoreHeading}>{t("nutritionScore")}</Text>
              <Text
                style={[
                  styles.scoreLabel,
                  { color: getScoreColor(analyzedMeal.score) },
                ]}
              >
                {getScoreLabel(analyzedMeal.score)}
              </Text>
            </View>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500).duration(500)}>
            <Text style={styles.sectionHeading}>{t("macronutrients")}</Text>
            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                {renderMacroIcon("protein")}
                <Text style={styles.macroValue}>{analyzedMeal.proteins}g</Text>
                <Text style={styles.macroLabel}>{t("proteins")}</Text>
              </View>
              <View style={styles.macroItem}>
                {renderMacroIcon("carbs")}
                <Text style={styles.macroValue}>{analyzedMeal.carbs}g</Text>
                <Text style={styles.macroLabel}>{t("carbs")}</Text>
              </View>
              <View style={styles.macroItem}>
                {renderMacroIcon("fats")}
                <Text style={styles.macroValue}>{analyzedMeal.fats}g</Text>
                <Text style={styles.macroLabel}>{t("fats")}</Text>
              </View>
            </View>
          </Animated.View>

          {analyzedMeal.insights && analyzedMeal.insights.length > 0 && (
            <Animated.View entering={FadeInUp.delay(600).duration(500)}>
              <Text style={styles.sectionHeading}>{t("insights")}</Text>
              <LiquidGlassView effect="clear" style={styles.insightsList}>
                {analyzedMeal.insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <View style={styles.insightIconContainer}>
                      <MaterialCommunityIcons
                        name="lightbulb"
                        size={scale(20)}
                        color={colors["color-warning-600"]}
                      />
                    </View>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </LiquidGlassView>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.actionContainer}
          >
            <LiquidGlassView
              effect="clear"
              interactive
              style={styles.actionButtonPrimary}
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
                <Text style={styles.actionText}>{t("scanAnother")}</Text>
              </TouchableOpacity>
            </LiquidGlassView>

            <LiquidGlassView
              effect="clear"
              interactive
              style={styles.actionButton}
            >
              <TouchableOpacity
                style={styles.actionButtonInner}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={scale(22)}
                  color={colors["color-primary-50"]}
                />
                <Text
                  style={[
                    styles.actionText,
                    { color: colors["color-primary-50"] },
                  ]}
                >
                  {t("delete")}
                </Text>
              </TouchableOpacity>
            </LiquidGlassView>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: scale(40) }} />
        </ScrollView>
      )}
    </TrueSheet>
  );
};

const ACCENT_GREEN = "#4CAF50";

const styles = StyleSheet.create({
  photo: {
    height: scale(500),
    width: "100%",
    borderRadius: scale(24),
  },
  // Analyzing overlay styles
  analyzingContainer: {
    position: "relative",
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: scale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  loaderOuterRing: {
    position: "absolute",
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    borderWidth: 2,
    borderColor: ACCENT_GREEN + "40",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderEmoji: {
    position: "absolute",
    fontSize: scale(20),
    top: -scale(10),
  },
  loaderEmoji2: {
    top: "auto",
    bottom: -scale(10),
    right: scale(10),
  },
  loaderEmoji3: {
    top: "auto",
    left: -scale(10),
    bottom: scale(20),
  },
  loaderEmoji4: {
    top: scale(20),
    right: -scale(10),
  },
  loaderIconContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    backgroundColor: ACCENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(16),
    shadowColor: ACCENT_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzingText: {
    ...fontStyles.headline3,
    color: "white",
    textAlign: "center",
    marginTop: scale(8),
  },
  camera: {
    height: scale(500),
    width: "100%",
  },
  takePhotoButton: {
    position: "absolute",
    bottom: scale(24),
    backgroundColor: colors["color-danger-500"],
    zIndex: 99,
    height: scale(80),
    width: scale(80),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 5,
    borderColor: colors["color-primary-100"],
  },
  mealTypeContainer: {
    marginTop: scale(24),
    marginHorizontal: scale(24),
  },
  analyzedContainer: {
    flex: 1,
  },
  analyzedTitle: {
    ...fontStyles.headline1,
    color: colors["color-primary-900"],
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
    backgroundColor: colors["color-primary-50"],
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
    color: colors["color-primary-900"],
    marginBottom: scale(12),
    lineHeight: scale(28),
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors["color-danger-100"],
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    alignSelf: "flex-start",
  },
  calorieValue: {
    ...fontStyles.headline3,
    color: colors["color-danger-600"],
    fontWeight: "700",
    marginLeft: scale(6),
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: colors["color-danger-600"],
    marginLeft: scale(2),
    fontWeight: "600",
  },
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(28),
    backgroundColor: colors["color-primary-50"],
    padding: scale(20),
    borderRadius: scale(20),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginRight: scale(18),
  },
  scoreValue: {
    ...fontStyles.headline1,
    fontSize: scale(32),
    color: "white",
    fontWeight: "bold",
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreHeading: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: scale(6),
    fontWeight: "600",
  },
  scoreLabel: {
    ...fontStyles.headline2,
    fontWeight: "700",
  },
  sectionHeading: {
    ...fontStyles.headline2,
    color: colors["color-primary-900"],
    marginBottom: scale(16),
    fontWeight: "700",
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(28),
    gap: scale(12),
    backgroundColor: colors["color-primary-50"],
    borderRadius: scale(20),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    padding: scale(16),
    borderRadius: scale(20),
    minHeight: scale(120),
    justifyContent: "center",
  },
  macroValue: {
    ...fontStyles.headline2,
    color: colors["color-primary-900"],
    marginTop: scale(10),
    marginBottom: scale(4),
    fontWeight: "700",
  },
  macroLabel: {
    ...fontStyles.body2,
    color: colors["color-primary-600"],
    letterSpacing: 0.5,
    textAlign: "center",
    fontWeight: "500",
  },
  insightsList: {
    borderRadius: scale(20),
    padding: scale(18),
    marginBottom: scale(28),
    backgroundColor: colors["color-primary-50"],
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(16),
  },
  insightIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors["color-warning-100"],
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    marginTop: scale(2),
  },
  insightIcon: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body1,
    flex: 1,
    color: colors["color-primary-800"],
    lineHeight: scale(22),
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
    backgroundColor: colors["color-danger-500"],
  },
  actionButtonPrimary: {
    flex: 1.5,
    borderRadius: scale(20),
    overflow: "hidden",
    backgroundColor: colors["color-primary-50"],
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
    color: colors["color-primary-600"],
  },
});

export default ScanMealTrueSheet;
