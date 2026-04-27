import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState } from "react";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { Alert } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import AnalyzingMealOverlay from "../../../components/AnalyzingMealOverlay";
import { t } from "i18next";
import { useNavigation } from "@react-navigation/native";
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
import { TrueSheetNames } from "../../../navigation/constants";
import { eventBus, AppEvent } from "../../../services/EventBus";
import useUserStore from "../../../zustand/useUserStore";
import { analyticsService, AnalyticsEvent } from "../../../services/analytics";
import { getLocalDateKey } from "../../../utils/dateUtils";
import type { ScanMealTrueSheetStep } from "./ScanMealTrueSheetTypes";
import ScanMealCameraStep from "./ScanMealCameraStep";
import ScanMealCapturedStep from "./ScanMealCapturedStep";

type ScanMealTrueSheetProps = {
  params: {
    mealType?: string;
    selectedDate: string;
  };
};

const getPhotoUri = (path: string) =>
  path.startsWith("file://") ? path : `file://${path}`;

const ScanMealTrueSheet = (props: ScanMealTrueSheetProps) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 1280 } },
    { photoAspectRatio: 1 },
  ]);
  const cameraRef = useRef<Camera>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedMealType, setSelectedMealType] = useState<string>(
    t("breakfast"),
  );
  const [screenState, setScreenState] =
    useState<ScanMealTrueSheetStep>("camera");
  const photoUri = photo ? getPhotoUri(photo.path) : null;

  const resetState = () => {
    setPhoto(null);
    setScreenState("camera");
    setSelectedMealType(t("breakfast"));
  };

  const dismiss = () => {
    setTimeout(() => {
      TrueSheet.dismiss(TrueSheetNames.SCAN_MEAL);
    }, 100);
  };

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePhoto();
    setPhoto(photo ?? null);
    if (photo) {
      setScreenState("captured");
    }
  };

  const uploadLocalMealImage = async (meal: IMeal, localImagePath: string) => {
    const imageUrl = await uploadMealImageToFireStorage(
      localImagePath,
      meal.id ?? "",
      useUserStore.getState()?.uid ?? "",
    );
    console.log("IMAGE URL", imageUrl);
    if (typeof imageUrl === "string") {
      meal.image = imageUrl;
      await updateMeal(meal);
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
        eventBus.publish(AppEvent.MealChanged, { date: meal.date });
      }

      analyticsService.logEvent(AnalyticsEvent.MealLogged, {
        type: "scan",
        description: meal.description ?? "",
      });

      setLoading(false);
      dismiss();
      navigation.navigate("AnalyzedMeal", { mealId: meal.id ?? "" });

      if (meal.image) {
        void uploadLocalMealImage(meal, meal.image);
      }
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

  const handleNewScan = () => {
    resetState();
  };

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
        <ScanMealCameraStep
          device={device}
          format={format}
          cameraRef={cameraRef}
          onTakePhoto={takePhoto}
        />
      )}
      {screenState === "captured" && photo && photoUri && (
        <ScanMealCapturedStep
          photo={photo}
          photoUri={photoUri}
          loading={loading}
          selectedMealType={selectedMealType}
          onSelectedMealTypeChange={setSelectedMealType}
          onAnalyze={savePhoto}
          onRetake={handleNewScan}
        />
      )}
      <AnalyzingMealOverlay visible={loading} variant="dots" />
    </TrueSheet>
  );
};

export default ScanMealTrueSheet;
