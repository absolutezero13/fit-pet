import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState, useEffect } from "react";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { scale } from "../../../theme/utils";
import { Alert, Image, Pressable, StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../../../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../../components/AppButton";
import { t } from "i18next";
import { createGeminiVisionCompletion } from "../../../services/gptApi";
import { IMeal } from "../../../services/apiTypes";
import { createMeal } from "../../../services/mealAnalysis";
import useMealsStore from "../../../zustand/useMealsStore";
import FullPageSpinner from "../../../components/FullPageSpinner";
import promptBuilder from "../../../utils/promptBuilder";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { useNavigation } from "@react-navigation/native";
import MealTypes from "./MealTypes";
import { TrueSheetNames } from "../../../navigation/constants";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { fontStyles } from "../../../theme/fontStyles";
import { deleteMeal } from "../../../services/mealAnalysis";

type ScanMealTrueSheetProps = {
  params: {
    mealType?: string;
    selectedDate: string;
  };
};

type ScreenState = "camera" | "captured" | "analyzing" | "analyzed";

// Animation timing constants
const ANIMATION_DISMISS_DELAY = 200;
const ANIMATION_NAVIGATION_DELAY = 300;

const ScanMealTrueSheet = (props: ScanMealTrueSheetProps) => {
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [{ photoAspectRatio: 1 }]);
  const cameraRef = useRef<Camera>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [selectedMealType, setSelectedMealType] = useState<string>(
    t("breakfast")
  );
  const [screenState, setScreenState] = useState<ScreenState>("camera");
  const [analyzedMeal, setAnalyzedMeal] = useState<IMeal | null>(null);

  // Animation values
  const imageWidth = useSharedValue(100);
  const imageHeight = useSharedValue(scale(500));
  const imageMarginRight = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const detailsOpacity = useSharedValue(0);
  const macrosOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);

  // Animated styles
  const animatedImageStyle = useAnimatedStyle(() => ({
    width: `${imageWidth.value}%`,
    height: imageHeight.value,
    marginRight: imageMarginRight.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const animatedDetailsStyle = useAnimatedStyle(() => ({
    opacity: detailsOpacity.value,
  }));

  const animatedMacrosStyle = useAnimatedStyle(() => ({
    opacity: macrosOpacity.value,
  }));

  const animatedActionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  // Trigger animations when analysis completes
  useEffect(() => {
    if (screenState === "analyzed" && analyzedMeal) {
      // Shrink image and align left
      imageWidth.value = withSpring(40, {
        damping: 15,
        stiffness: 100,
      });
      imageHeight.value = withSpring(scale(150), {
        damping: 15,
        stiffness: 100,
      });
      imageMarginRight.value = withSpring(scale(16), {
        damping: 15,
        stiffness: 100,
      });

      // Fade in meal name/description
      contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

      // Staggered bottom-up animations for details
      detailsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
      macrosOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
      actionsOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
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
    // Reset animation values
    imageWidth.value = 100;
    imageHeight.value = scale(500);
    imageMarginRight.value = 0;
    contentOpacity.value = 0;
    detailsOpacity.value = 0;
    macrosOpacity.value = 0;
    actionsOpacity.value = 0;
  };

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePhoto();
    setPhoto(photo ?? null);
    if (photo) {
      setScreenState("captured");
    }
  };

  console.log("photo", photo?.path);

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

      // Instead of navigating away, show the analyzed meal in the sheet
      setAnalyzedMeal(meal);
      setScreenState("analyzed");
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

  const handleEdit = () => {
    if (!analyzedMeal?._id) return;
    dismiss();
    setTimeout(() => {
      navigation.navigate("LogMeal", {
        mealId: analyzedMeal._id,
        selectedDate: analyzedMeal.date,
      });
      resetState();
    }, ANIMATION_NAVIGATION_DELAY);
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
      {/* Camera View */}
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

      {/* Captured Photo View */}
      {screenState === "captured" && photo && (
        <>
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

      {/* Analyzing View */}
      {screenState === "analyzing" && photo && (
        <>
          <Image source={{ uri: photo.path }} style={styles.photo} />
          <FullPageSpinner visible={true} />
        </>
      )}

      {/* Analyzed Meal View */}
      {screenState === "analyzed" && analyzedMeal && photo && (
        <ScrollView
          style={styles.analyzedContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section with Image and Basic Info */}
          <View style={styles.topSection}>
            <Animated.Image
              source={{ uri: photo.path }}
              style={[styles.analyzedImage, animatedImageStyle]}
            />
            <Animated.View style={[styles.basicInfo, animatedContentStyle]}>
              <Text style={styles.mealName} numberOfLines={2}>
                {analyzedMeal.description}
              </Text>
              <View style={styles.calorieContainer}>
                <Text style={styles.calorieValue}>{analyzedMeal.calories}</Text>
                <Text style={styles.calorieUnit}>{t("cal")}</Text>
              </View>
            </Animated.View>
          </View>

          {/* Score Section */}
          <Animated.View style={[styles.scoreSection, animatedDetailsStyle]}>
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

          {/* Macros Section */}
          <Animated.View style={animatedMacrosStyle}>
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

          {/* Insights Section */}
          {analyzedMeal.insights && analyzedMeal.insights.length > 0 && (
            <Animated.View style={animatedMacrosStyle}>
              <Text style={styles.sectionHeading}>{t("insights")}</Text>
              <View style={styles.insightsList}>
                {analyzedMeal.insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <MaterialCommunityIcons
                      name="lightbulb-outline"
                      size={scale(18)}
                      color={colors["color-warning-500"]}
                      style={styles.insightIcon}
                    />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View style={[styles.actionContainer, animatedActionsStyle]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderColor: colors["color-primary-300"],
                },
              ]}
              onPress={handleNewScan}
            >
              <MaterialCommunityIcons
                name="camera-plus"
                size={scale(20)}
                color={colors["color-primary-500"]}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: colors["color-primary-500"],
                  },
                ]}
              >
                {t("scanAnother")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderColor: colors["color-primary-300"],
                },
              ]}
              onPress={handleEdit}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={scale(20)}
                color={colors["color-primary-500"]}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: colors["color-primary-500"],
                  },
                ]}
              >
                {t("edit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderColor: colors["color-danger-300"],
                },
              ]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={scale(20)}
                color={colors["color-danger-500"]}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: colors["color-danger-500"],
                  },
                ]}
              >
                {t("delete")}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: scale(32) }} />
        </ScrollView>
      )}
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  photo: {
    height: scale(500),
    width: "100%",
    borderRadius: scale(24),
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
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
  },
  topSection: {
    flexDirection: "row",
    marginBottom: scale(20),
    alignItems: "flex-start",
  },
  analyzedImage: {
    borderRadius: scale(16),
    resizeMode: "cover",
  },
  basicInfo: {
    flex: 1,
    justifyContent: "center",
  },
  mealName: {
    ...fontStyles.headline3,
    color: colors["color-primary-900"],
    marginBottom: scale(8),
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: colors["color-primary-100"],
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    alignSelf: "flex-start",
  },
  calorieValue: {
    ...fontStyles.headline3,
    color: colors["color-success-500"],
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: colors["color-success-500"],
    marginLeft: scale(4),
  },
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(24),
    backgroundColor: "white",
    padding: scale(16),
    borderRadius: scale(16),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: scale(16),
  },
  scoreValue: {
    ...fontStyles.headline1,
    color: "white",
    fontWeight: "bold",
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreHeading: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: scale(4),
  },
  scoreLabel: {
    ...fontStyles.headline3,
    fontWeight: "600",
  },
  sectionHeading: {
    ...fontStyles.headline3,
    color: colors["color-primary-900"],
    marginBottom: scale(12),
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(24),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    padding: scale(12),
    borderRadius: scale(12),
    marginHorizontal: scale(4),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  macroValue: {
    ...fontStyles.headline3,
    color: colors["color-primary-900"],
    marginTop: scale(6),
    marginBottom: scale(2),
  },
  macroLabel: {
    ...fontStyles.footnote,
    color: colors["color-primary-600"],
    letterSpacing: 0.5,
    textAlign: "center",
  },
  insightsList: {
    backgroundColor: "white",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(20),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(10),
  },
  insightIcon: {
    marginRight: scale(10),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body2,
    flex: 1,
    color: colors["color-primary-900"],
    lineHeight: scale(18),
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(12),
    borderWidth: 1,
    borderRadius: scale(12),
    flex: 1,
    marginHorizontal: scale(4),
    backgroundColor: "white",
  },
  actionText: {
    ...fontStyles.body2,
    marginLeft: scale(6),
    fontWeight: "500",
    fontSize: scale(11),
  },
});

export default ScanMealTrueSheet;
