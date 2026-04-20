import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../../components/AppButton";
import AnalyzingMealOverlay from "../../../components/AnalyzingMealOverlay";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GeminiResponse, IMeal } from "../../../services/apiTypes";
import useMealsStore from "../../../zustand/useMealsStore";
import {
  KeyboardGestureArea,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import promptBuilder from "../../../utils/promptBuilder";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import {
  createGeminiCompletion,
  createGeminiVisionCompletion,
} from "../../../services/gptApi";
import {
  createMeal,
  updateMeal,
  uploadMealImageToFireStorage,
} from "../../../services/mealAnalysis";
import MealTypes from "./MealTypes";
import useUserStore from "../../../zustand/useUserStore";
import { TrueSheetNames } from "../../../navigation/constants";
import { useTheme } from "../../../theme/ThemeContext";
import { analyticsService, AnalyticsEvent } from "../../../services/analytics";
import { getLocalDateKey } from "../../../utils/dateUtils";
import { syncMealLiveActivity } from "../../../services/mealLiveActivitySync";

type LogMealTrueSheetProps = {
  params: {
    mealId?: string;
    mealType?: string;
    selectedDate: string;
  };
};
const LogMealTrueSheet = (props: LogMealTrueSheetProps) => {
  const dismiss = async () => {
    setTimeout(() => {
      TrueSheet.dismiss(TrueSheetNames.LOG_MEAL);
    }, 100);
  };

  const navigation = useNavigation();
  const params = props.params;
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const mealToEdit = useMealsStore((state) =>
    state.loggedMeals.find((meal) => meal.id === params.mealId),
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const { height } = useReanimatedKeyboardAnimation();

  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [mealDescription, setMealDescription] = useState(
    mealToEdit?.description ?? "",
  );
  const [selectedMealType, setSelectedMealType] = useState(
    t(mealToEdit?.mealType ?? params.mealType ?? "breakfast"),
  );

  useEffect(() => {
    setSelectedMealType(
      t(mealToEdit?.mealType ?? params.mealType ?? "breakfast"),
    );
  }, [params.mealType]);

  const pickImage = async (source: "camera" | "gallery") => {
    let result;

    if (source === "camera") {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sorry", "Camera permission is required to take a photo.");
        return;
      }

      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });
    } else {
      // Request media library permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry",
          "Media library permission is required to select an image.",
        );
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleAddMeal = async (mealDescription: string, mealType: string) => {
    const prompt = promptBuilder.createAnalysisPrompt(
      useOnboardingStore.getState(),
      mealDescription,
      mealType,
      new Date(params.selectedDate).toLocaleDateString("en-US"),
    );

    let response: { response: GeminiResponse };

    if (image) {
      response = await createGeminiVisionCompletion(
        {
          uri: image.uri,
          mimeType: image.mimeType ?? "image/jpeg",
        },

        prompt ?? null,
        "analyzedMeal",
      );
    } else {
      response = await createGeminiCompletion(prompt, "analyzedMeal");
    }

    const meal: IMeal = JSON.parse(
      response.response.candidates[0].content.parts[0].text,
    );

    console.log("ANALYZED MEAL RESPONSE", meal);

    if (!mealToEdit) {
      meal.date = getLocalDateKey(params.selectedDate);
      meal.image = image?.uri ?? null;

      if (!meal.description) {
        meal.description = mealDescription;
      }
      console.log("CREATING MEAL", meal);
      const responseMeal = await createMeal(meal);
      meal.id = responseMeal.id;
    } else {
      meal.id = mealToEdit.id;
      meal.date = mealToEdit.date;
      meal.description = mealDescription;
      meal.image = image?.uri ?? mealToEdit.image;
      await updateMeal(meal);
    }

    if (meal.image) {
      const imageUrl = await uploadMealImageToFireStorage(
        meal.image,
        meal.id ?? "",
        useUserStore.getState()?.uid ?? "",
      );
      console.log("IMAGE URL", imageUrl);
      meal.image = imageUrl;
    }

    if (!meal.errorMessage) {
      const meals = useMealsStore.getState().loggedMeals;
      const newMeals = meals.filter((m) => m.id !== mealToEdit?.id);
      useMealsStore.setState({ loggedMeals: [...newMeals, meal] });
      syncMealLiveActivity(meal.date);
    }
    return meal;
  };

  const handleSaveMeal = async () => {
    if (!mealDescription.trim() && !image) return;
    setIsAnalyzing(true);
    textInputRef.current?.blur();
    try {
      const meal = await handleAddMeal(mealDescription, selectedMealType);
      console.log("analyzed meal:", meal);
      if (meal.errorMessage) {
        analyticsService.logEvent(AnalyticsEvent.MealLogError);
        Alert.alert(
          t("globalError"),
          meal.errorMessage ?? t("globalErrorMessage"),
        );
        return;
      }

      analyticsService.logEvent(AnalyticsEvent.MealLogged, {
        type: "text",
        description: meal.description ?? mealDescription,
      });

      if (mealToEdit) {
        dismiss();
        return;
      }

      dismiss();
      navigation.navigate("AnalyzedMeal", {
        mealId: meal.id ?? "",
      });
    } catch (error) {
      console.error("Error analyzing meal:", error);
      analyticsService.logEvent(AnalyticsEvent.MealLogError);
      Alert.alert(t("globalError"), t("globalErrorMessage"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const contentExists = !!(mealDescription.trim() || image);
  return (
    <TrueSheet
      dismissible={!isAnalyzing}
      onDidDismiss={() => {
        setIsAnalyzing(false);
        setMealDescription("");
        setImage(null);
        setSelectedMealType(t("breakfast"));
      }}
      name={TrueSheetNames.LOG_MEAL}
      detents={["auto"]}
      backgroundColor={colors.background}
      insetAdjustment="never"
      blurOptions={{
        interaction: false,
      }}
    >
      <KeyboardGestureArea
        interpolator="ios"
        offset={scale(50)}
        textInputNativeID="composer"
        style={{}}
      >
        <View style={[styles.container, {}]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t("describeYourMeal")}
            </Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                keyboardType="default"
                ref={textInputRef}
                style={[
                  styles.textInput,
                  {
                    paddingRight: image ? scale(140) : scale(24),
                    borderColor: colors["color-primary-900"],
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder={t("exampleMeal")}
                placeholderTextColor={colors.textTertiary}
                value={mealDescription}
                onChangeText={setMealDescription}
                multiline
                numberOfLines={3}
              />
              {!image && (
                <TouchableOpacity
                  style={[
                    styles.imagePickerButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    Alert.alert(t("addImage"), t("chooseImageSource"), [
                      {
                        text: t("camera"),
                        onPress: () => pickImage("camera"),
                      },
                      {
                        text: t("gallery"),
                        onPress: () => pickImage("gallery"),
                      },
                      {
                        text: t("cancel"),
                        style: "cancel",
                      },
                    ]);
                  }}
                >
                  <FontAwesome5
                    name="image"
                    size={scale(24)}
                    color={colors.text}
                  />
                </TouchableOpacity>
              )}
              {image && (
                <View style={styles.imageWrapper}>
                  <AntDesign
                    style={{
                      position: "absolute",
                      right: scale(-4),
                      bottom: 0,
                      zIndex: 99,
                    }}
                    name="delete"
                    size={scale(24)}
                    color={colors["color-danger-600"]}
                    onPress={() => setImage(null)}
                  />
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.mealTypeContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t("mealType")}
            </Text>
            <MealTypes
              selectedMealType={selectedMealType}
              setSelectedMealType={setSelectedMealType}
            />
          </View>
          <View
            style={{
              ...styles.buttonView,
              paddingBottom: bottom,
            }}
          >
            <AppButton
              title={t("analyzeMeal")}
              onPress={handleSaveMeal}
              disabled={isAnalyzing || !contentExists}
            />
          </View>
        </View>
        <AnalyzingMealOverlay visible={isAnalyzing} variant="dots" />
      </KeyboardGestureArea>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(24),
  },
  modalTitle: {
    ...fontStyles.headline2,
  },
  inputContainer: {
    marginBottom: scale(20),
  },
  inputLabel: {
    ...fontStyles.headline3,
    marginBottom: scale(8),
  },
  textInput: {
    borderWidth: 1,
    borderRadius: scale(12),
    padding: scale(12),
    ...fontStyles.body1,
    minHeight: scale(150),
    textAlignVertical: "top",
  },
  mealTypeContainer: {
    marginBottom: scale(24),
  },

  buttonView: {
    width: "100%",
  },
  textInputWrapper: {
    position: "relative",
  },
  imagePickerButton: {
    position: "absolute",
    bottom: scale(8),
    right: scale(8),
    borderRadius: scale(20),
    width: scale(36),
    height: scale(36),
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    height: scale(120),
    width: scale(120),
    borderRadius: scale(60),
  },
  imageWrapper: {
    marginTop: scale(12),
    position: "absolute",
    right: scale(8),
    bottom: scale(15),
  },
});

export default LogMealTrueSheet;
