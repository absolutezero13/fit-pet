import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useOnboardingStore from "../zustand/useOnboardingStore";
import {
  createGeminiCompletion,
  createGeminiVisionCompletion,
} from "../services/gptApi";
import useMealsStore from "../zustand/useMealsStore";
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { GeminiResponse, IMeal } from "../services/apiTypes";
import { useTranslation } from "react-i18next";
import {
  KeyboardGestureArea,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import promptBuilder from "../utils/promptBuilder";
import FullPageSpinner from "../components/FullPageSpinner";

const LogMealScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const [mealDescription, setMealDescription] = useState("");
  const [selectedMealType, setSelectedMealType] = useState(t("breakfast"));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const { height } = useReanimatedKeyboardAnimation();

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      mealType
    );

    let response: { response: GeminiResponse };

    if (image) {
      response = await createGeminiVisionCompletion(
        {
          uri: image.uri,
          mimeType: image.type ?? "image/jpeg",
        },

        prompt ?? null,
        "analyzedMeal"
      );
    } else {
      response = await createGeminiCompletion(prompt, "analyzedMeal");
    }

    console.log("response", response);
    const meal: IMeal = JSON.parse(
      response.response.candidates[0].content.parts[0].text
    );

    console.log("meal", meal);

    if (!meal.mealType) {
      return null;
    }

    meal.date = new Date().toLocaleDateString("en-US");

    // Add new meal to the meals array
    const meals = useMealsStore.getState().loggedMeals;
    useMealsStore.setState({ loggedMeals: [...meals, meal] });
    // storageService.setItem("meals", [...meals, meal]);
    return meal;
  };

  const handleSaveMeal = async () => {
    if (!mealDescription.trim() && !image) return;
    setIsAnalyzing(true);
    const meal = await handleAddMeal(mealDescription, selectedMealType);

    setIsAnalyzing(false);

    if (!meal) {
      Alert.alert(
        "Meal could not be analyzed",
        "Please make sure the meal description is a valid food item."
      );
      return;
    }

    navigation.dispatch(
      StackActions.replace("AnalyzedMeal", {
        meal,
      })
    );
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
          }}
        >
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (isAnalyzing || !contentExists) && styles.disabledButton,
              { marginBottom: bottom },
            ]}
            onPress={handleSaveMeal}
            disabled={isAnalyzing || !contentExists}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>{t("analyzeMeal")}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
      <FullPageSpinner visible={isAnalyzing} />
    </KeyboardGestureArea>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  bottomSheetContent: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(24),
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
  },
  header: {
    padding: scale(24),
    paddingTop: scale(60),
    paddingBottom: scale(32),
    backgroundColor: colors["color-primary-200"],
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
  },
  title: {
    ...fontStyles.headline1,
  },
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: scale(100),
  },
  sectionContainer: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
  },
  mealItem: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(12),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  mealItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealItemLeft: {
    flex: 1,
  },
  mealItemTitle: {
    ...fontStyles.headline4,
    marginBottom: scale(4),
  },
  mealItemTime: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  mealItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesText: {
    ...fontStyles.body2,
    color: colors["color-success-400"],
    marginRight: scale(8),
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
    alignItems: "center",
    marginHorizontal: scale(24),
  },
  analyzeButton: {
    backgroundColor: colors["color-success-400"],
    padding: scale(16),
    borderRadius: scale(12),
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: colors["color-primary-300"],
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: colors["color-primary-500"],
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginTop: scale(16),
  },
  buttonText: {
    ...fontStyles.headline4,
    color: "white",
  },
  nutritionContainer: {
    marginTop: scale(24),
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(16),
    padding: scale(16),
  },
  nutritionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
    textAlign: "center",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(12),
    alignItems: "center",
  },
  nutritionValue: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
  },
  nutritionLabel: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
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
