import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { scale } from "../../../theme/utils";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
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

const ScanMealTrueSheet = forwardRef<{
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
}>((props, ref) => {
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [{ photoAspectRatio: 1 }]);
  const sheet = useRef<TrueSheet>(null);
  const cameraRef = useRef<Camera>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [selectedMealType, setSelectedMealType] = useState<string>(
    t("breakfast")
  );
  const present = async () => {
    await sheet.current?.present();
  };

  const dismiss = async () => {
    await sheet.current?.dismiss();
  };

  useImperativeHandle(ref, () => ({
    present,
    dismiss,
  }));

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePhoto();
    setPhoto(photo ?? null);
  };

  console.log("photo", photo?.path);

  const savePhoto = async () => {
    try {
      setLoading(true);
      const prompt = promptBuilder.createAnalysisPrompt(
        useOnboardingStore.getState(),
        "",
        "breakfast",
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
      const responseMeal = await createMeal(meal);
      meal._id = responseMeal._id;
      dismiss();

      if (!meal.errorMessage) {
        const meals = useMealsStore.getState().loggedMeals;
        useMealsStore.setState({ loggedMeals: [...meals, meal] });
      }

      navigation.navigate("AnalyzedMeal", {
        mealId: meal._id,
      });
      setPhoto(null);
      dismiss();
    } catch (error) {
      console.log("ERROR SAVING PHOTO", error);
      Alert.alert("Error", "Failed to save photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrueSheet
      onDidDismiss={() => {
        setTimeout(() => {
          setPhoto(null);
          setSelectedMealType(t("breakfast"));
        }, 100);
      }}
      ref={sheet}
      detents={["auto"]}
      blurTint="system-thick-material-light"
      insetAdjustment="never"
      blurOptions={{
        interaction: false,
      }}
    >
      {photo && <Image source={{ uri: photo.path }} style={styles.photo} />}
      <View>
        {device && !photo && (
          <Camera
            photo={true}
            ref={cameraRef}
            device={device}
            format={format}
            isActive={true}
            style={styles.camera}
            photoQualityBalance="speed"
          />
        )}

        {device && !photo && (
          <Pressable
            onPress={takePhoto}
            style={styles.takePhotoButton}
          ></Pressable>
        )}
        {photo && (
          <Pressable
            onPress={() => setPhoto(null)}
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
        )}
      </View>

      {photo && (
        <>
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
      {loading && <FullPageSpinner visible={loading} />}
    </TrueSheet>
  );
});

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
});

export default ScanMealTrueSheet;
