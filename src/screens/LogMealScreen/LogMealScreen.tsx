import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import {
  KeyboardGestureArea,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import AppButton from "../../components/AppButton";
import FullPageSpinner from "../../components/FullPageSpinner";
import { GeminiResponse, IMeal } from "../../services/apiTypes";
import {
  createGeminiVisionCompletion,
  createGeminiCompletion,
} from "../../services/gptApi";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { scale } from "../../theme/utils";
import promptBuilder from "../../utils/promptBuilder";
import useMealsStore from "../../zustand/useMealsStore";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { createMeal, updateMeal } from "../../services/mealAnalysis";

const LogMealScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<
      {
        params: {
          selectedDate: string;
          mealId?: string;
        };
      },
      "params"
    >
  >();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const mealToEdit = useMealsStore((state) =>
    state.loggedMeals.find((meal) => meal._id === route.params.mealId)
  );

  console.log("MEAL TO EDIT", mealToEdit);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const { height } = useReanimatedKeyboardAnimation();

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [mealDescription, setMealDescription] = useState(
    mealToEdit?.description ?? ""
  );
  const [selectedMealType, setSelectedMealType] = useState(
    t(mealToEdit?.mealType ?? "breakfast")
  );

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
          "Media library permission is required to select an image."
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
      new Date(route.params.selectedDate).toLocaleDateString("en-US")
    );

    let response: { response: GeminiResponse };

    if (image) {
      response = await createGeminiVisionCompletion(
        {
          uri: image.uri,
          mimeType: image.mimeType ?? "image/jpeg",
        },

        prompt ?? null,
        "analyzedMeal"
      );
    } else {
      response = await createGeminiCompletion(prompt, "analyzedMeal");
    }

    const meal: IMeal = JSON.parse(
      response.response.candidates[0].content.parts[0].text
    );

    console.log("ANALYZED MEAL RESPONSE", meal);

    if (!mealToEdit) {
      meal.date = new Date(route.params.selectedDate).toISOString();
      meal.image = image?.uri ?? null;

      if (!meal.description) {
        meal.description = mealDescription;
      }
      console.log("CREATING MEAL", meal);
      const responseMeal = await createMeal(meal);
      meal._id = responseMeal._id;
    } else {
      meal._id = mealToEdit._id;
      meal.date = mealToEdit.date;
      meal.description = mealDescription;
      meal.image = image?.uri ?? mealToEdit.image;
      await updateMeal(meal);
    }

    if (!meal.errorMessage) {
      const meals = useMealsStore.getState().loggedMeals;
      const newMeals = meals.filter((m) => m._id !== mealToEdit?._id);
      useMealsStore.setState({ loggedMeals: [...newMeals, meal] });
    }
    return meal;
  };

  const handleSaveMeal = async () => {
    if (!mealDescription.trim() && !image) return;
    setIsAnalyzing(true);
    try {
      const meal = await handleAddMeal(mealDescription, selectedMealType);
      console.log("analyzed meal:", meal);
      if (meal.errorMessage) {
        setIsAnalyzing(false);
        Alert.alert(
          "Meal could not be analyzed",
          meal.errorMessage ?? "Please try again later."
        );
        return;
      }

      if (mealToEdit) {
        navigation.goBack();
        return;
      }

      navigation.dispatch(
        StackActions.replace("AnalyzedMeal", {
          mealId: meal._id,
        })
      );
    } catch (error) {
      console.error("Error analyzing meal:", error);
      Alert.alert(t("globalError"), t("globalErrorMessage"));
      setIsAnalyzing(false);
    }
  };

  const closeModal = () => {
    navigation.goBack();
  };

  const mealTypes = [t("breakfast"), t("lunch"), t("dinner"), t("snack")];

  const contentExists = !!(mealDescription.trim() || image);

  return (
    <KeyboardGestureArea
      interpolator="ios"
      offset={50}
      textInputNativeID="composer"
      style={{
        flex: 1,
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: "white",
          },
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t("logAMeal")}</Text>
          <TouchableOpacity onPress={closeModal}>
            <MaterialCommunityIcons
              name="close"
              size={scale(24)}
              color={colors["color-primary-500"]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("describeYourMeal")}</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              keyboardType="default"
              ref={textInputRef}
              style={[
                styles.textInput,
                {
                  paddingRight: image ? scale(140) : scale(24),
                },
              ]}
              placeholder={t("exampleMeal")}
              value={mealDescription}
              onChangeText={setMealDescription}
              multiline
              numberOfLines={3}
            />
            {!image && (
              <TouchableOpacity
                style={styles.imagePickerButton}
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
                  color={colors["color-primary-500"]}
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
          <Text style={styles.inputLabel}>Meal Type</Text>
          <View style={styles.mealTypeOptions}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedMealType === type && styles.mealTypeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Animated.View
          style={{
            ...styles.buttonView,
            transform: [{ translateY: height }],
            paddingBottom: bottom,
          }}
        >
          <AppButton
            loading={isAnalyzing}
            title={t("analyzeMeal")}
            onPress={handleSaveMeal}
            disabled={isAnalyzing || !contentExists}
          />
        </Animated.View>
      </View>
      <FullPageSpinner visible={isAnalyzing} />
    </KeyboardGestureArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: colors["color-primary-500"],
  },
  inputContainer: {
    marginBottom: scale(20),
  },
  inputLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    marginBottom: scale(8),
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors["color-primary-300"],
    borderRadius: scale(12),
    padding: scale(12),
    ...fontStyles.body1,
    minHeight: scale(150),
    textAlignVertical: "top",
  },
  mealTypeContainer: {
    marginBottom: scale(24),
  },
  mealTypeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: scale(-4),
  },
  mealTypeButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    backgroundColor: colors["color-primary-100"],
    marginHorizontal: scale(4),
    marginBottom: scale(8),
    height: scale(40),
  },
  mealTypeButtonActive: {
    backgroundColor: colors["color-primary-400"],
  },
  mealTypeText: {
    ...fontStyles.body2,
    color: colors["color-primary-500"],
  },
  mealTypeTextActive: {
    color: "white",
  },
  buttonView: {
    marginTop: "auto",
    position: "absolute",
    bottom: 0,
    width: "100%",
    marginHorizontal: scale(24),
  },
  textInputWrapper: {
    position: "relative",
  },
  imagePickerButton: {
    position: "absolute",
    bottom: scale(8),
    right: scale(8),
    backgroundColor: colors["color-primary-100"],
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

export default LogMealScreen;
