import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
import { KeyboardGestureArea } from "react-native-keyboard-controller";
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
import { eventBus, AppEvent } from "../../../services/EventBus";
import GlassView from "../../../components/SafeGlassView";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";

type LogMealTrueSheetProps = {
  sheetName?: TrueSheetNames;
  params: {
    mealId?: string;
    mealType?: string;
    selectedDate: string;
  };
};
const LogMealTrueSheet = (props: LogMealTrueSheetProps) => {
  const sheetName = props.sheetName ?? TrueSheetNames.LOG_MEAL;

  const dismiss = async () => {
    TrueSheet.dismiss(sheetName);
  };

  const navigation = useNavigation();
  const params = props.params;
  const { t, i18n } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const mealToEdit = useMealsStore((state) =>
    state.loggedMeals.find((meal) => meal.id === params.mealId),
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const speechBaseTextRef = useRef("");
  const speechFinalTextRef = useRef("");
  const inputBorderOpacity = useRef(new Animated.Value(0)).current;

  const [mealDescription, setMealDescription] = useState(
    mealToEdit?.description ?? "",
  );
  const [selectedMealType, setSelectedMealType] = useState(
    t(mealToEdit?.mealType ?? params.mealType ?? "breakfast"),
  );

  const syncFormForPresentation = () => {
    if (params.mealId) {
      const meal = useMealsStore
        .getState()
        .loggedMeals.find((m) => m.id === params.mealId);
      if (meal) {
        setMealDescription(meal.description ?? "");
        setSelectedMealType(t(meal.mealType ?? params.mealType ?? "breakfast"));
        setImage(null);
        return;
      }
    }
    setMealDescription("");
    setSelectedMealType(t(params.mealType ?? "breakfast"));
    setImage(null);
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t("globalError"),
        "Media library permission is required to select an image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const buildTranscriptText = (text: string) => {
    const transcript = text.trim();
    const baseText = speechFinalTextRef.current || speechBaseTextRef.current;

    if (!transcript) {
      return baseText;
    }

    return baseText ? `${baseText} ${transcript}` : transcript;
  };

  const handleSpeechStart = () => {
    setIsRecording(true);
  };

  const handleSpeechEnd = () => {
    setIsRecording(false);
    Animated.timing(inputBorderOpacity, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleSpeechResult = (event: {
    isFinal?: boolean;
    results: { transcript: string }[];
  }) => {
    const transcript = event.results[0]?.transcript ?? "";

    if (event.isFinal) {
      speechFinalTextRef.current = buildTranscriptText(transcript);
    }

    setMealDescription(buildTranscriptText(transcript));
  };

  const handleSpeechError = (event: { error: string }) => {
    setIsRecording(false);
    Animated.timing(inputBorderOpacity, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (event.error === "aborted" || event.error === "no-speech") {
      return;
    }

    Alert.alert(t("globalError"), t("globalErrorMessage"));
  };

  useSpeechRecognitionEvent("start", handleSpeechStart);
  useSpeechRecognitionEvent("end", handleSpeechEnd);
  useSpeechRecognitionEvent("result", handleSpeechResult);
  useSpeechRecognitionEvent("error", handleSpeechError);

  const startRecording = async () => {
    const isAvailable = ExpoSpeechRecognitionModule.isRecognitionAvailable();

    if (!isAvailable) {
      Alert.alert(t("globalError"), t("speechRecognitionUnavailable"));
      return;
    }

    const { granted } =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!granted) {
      Alert.alert(
        t("microphonePermissionTitle"),
        t("microphonePermissionMessage"),
      );
      return;
    }

    textInputRef.current?.blur();
    speechBaseTextRef.current = mealDescription.trim();
    speechFinalTextRef.current = mealDescription.trim();
    Animated.timing(inputBorderOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    ExpoSpeechRecognitionModule.start({
      lang: i18n.language.startsWith("tr") ? "tr-TR" : "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: true,
      iosTaskHint: "dictation",
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
      },
      contextualStrings: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "calories",
        "protein",
        "carbs",
        "fat",
      ],
    });
  };

  const stopRecording = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const cancelRecording = () => {
    if (!isRecording) {
      return;
    }

    ExpoSpeechRecognitionModule.abort();
  };

  const handleVoicePress = async () => {
    if (isAnalyzing) {
      return;
    }

    try {
      if (isRecording) {
        stopRecording();
        return;
      }

      await startRecording();
    } catch (error) {
      console.error("Error recognizing meal speech:", error);
      setIsRecording(false);
      Alert.alert(t("globalError"), t("globalErrorMessage"));
    }
  };

  const handleSheetDismiss = () => {
    cancelRecording();
    setIsAnalyzing(false);
    setIsRecording(false);
    inputBorderOpacity.setValue(0);
    setMealDescription("");
    setImage(null);
    setSelectedMealType(t("breakfast"));
  };

  const handleAddMeal = async (mealDescription: string, mealType: string) => {
    const prompt = promptBuilder.createAnalysisPrompt(
      useOnboardingStore.getState(),
      mealDescription,
      mealType,
    );

    let response: { response: GeminiResponse };

    if (image) {
      response = await createGeminiVisionCompletion(
        {
          uri: image.uri,
          mimeType: image.mimeType ?? "image/jpeg",
        },
        prompt,
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
      eventBus.publish(AppEvent.MealUpdated, { id: meal.id });
    }

    if (meal.image) {
      const imageUrl = await uploadMealImageToFireStorage(
        meal.image,
        meal.id ?? "",
        useUserStore.getState()?.uid ?? "",
      );
      console.log("IMAGE URL", imageUrl);
      if (typeof imageUrl === "string") {
        meal.image = imageUrl;
        await updateMeal(meal);
      }
    }

    if (!meal.errorMessage) {
      const meals = useMealsStore.getState().loggedMeals;
      const newMeals = meals.filter((m) => m.id !== mealToEdit?.id);
      useMealsStore.setState({ loggedMeals: [...newMeals, meal] });
      eventBus.publish(AppEvent.MealChanged, { date: meal.date });
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
  const isBusy = isAnalyzing;
  const voiceIconName = isRecording ? "stop" : "microphone";
  const voiceIconColor = isRecording ? colors["color-danger-600"] : colors.text;
  const voiceLabel = isRecording
    ? t("stopRecordingMeal")
    : t("recordMealDescription");
  const animatedInputBorderStyle = {
    opacity: inputBorderOpacity,
    borderColor: colors.accent,
  };

  return (
    <TrueSheet
      dismissible={!isBusy && !isRecording}
      onWillPresent={syncFormForPresentation}
      onDidDismiss={handleSheetDismiss}
      name={sheetName}
      detents={["auto"]}
      backgroundColor={colors.surface}
      insetAdjustment="never"
      blurOptions={{
        interaction: false,
        intensity: 100,
      }}
    >
      <KeyboardGestureArea
        interpolator="ios"
        offset={scale(50)}
        textInputNativeID="composer"
      >
        <View style={[styles.container, {}]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t("describeYourMeal")}
            </Text>
            <View style={styles.textInputWrapper}>
              <View
                style={[
                  styles.textInputFrame,
                  { borderColor: colors.border },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[styles.animatedInputBorder, animatedInputBorderStyle]}
                />
                <TextInput
                  keyboardType="default"
                  ref={textInputRef}
                  style={[
                    styles.textInput,
                    {
                      paddingRight: scale(72),
                      color: colors.text,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder={t("exampleMeal")}
                  placeholderTextColor={colors.textTertiary}
                  value={mealDescription}
                  onChangeText={setMealDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
              {!image && (
                <GlassView
                  effect="clear"
                  interactive={!isAnalyzing && !isRecording}
                  style={styles.galleryButton}
                >
                  <Pressable
                    accessibilityLabel={t("gallery")}
                    disabled={isAnalyzing || isRecording}
                    onPress={pickImageFromGallery}
                    style={styles.iconPressable}
                  >
                    <FontAwesome5
                      name="image"
                      size={scale(22)}
                      color={colors.text}
                    />
                  </Pressable>
                </GlassView>
              )}
              {image && (
                <View style={styles.imageWrapper}>
                  <AntDesign
                    style={styles.deleteImageIcon}
                    name="delete"
                    size={scale(22)}
                    color={colors["color-danger-600"]}
                    onPress={() => setImage(null)}
                  />
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                </View>
              )}
              <GlassView
                effect="clear"
                interactive={!isAnalyzing}
                style={styles.voiceButton}
              >
                <Pressable
                  accessibilityLabel={voiceLabel}
                  disabled={isAnalyzing}
                  onPress={handleVoicePress}
                  style={styles.iconPressable}
                >
                  <FontAwesome5
                    name={voiceIconName}
                    size={scale(22)}
                    color={voiceIconColor}
                  />
                </Pressable>
              </GlassView>
              {isRecording && (
                <Text
                  style={[styles.recordingStatus, { color: voiceIconColor }]}
                >
                  {t("recordingMeal")}
                </Text>
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
              disabled={isBusy || isRecording || !contentExists}
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
    borderRadius: scale(11),
    padding: scale(12),
    ...fontStyles.body1,
    minHeight: scale(150),
    textAlignVertical: "top",
  },
  textInputFrame: {
    borderRadius: scale(12),
    borderWidth: 1,
    overflow: "hidden",
  },
  animatedInputBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: scale(2),
    borderRadius: scale(12),
    zIndex: 1,
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
  voiceButton: {
    position: "absolute",
    bottom: scale(8),
    right: scale(8),
    borderRadius: scale(20),
    width: scale(44),
    height: scale(44),
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButton: {
    position: "absolute",
    bottom: scale(8),
    left: scale(8),
    borderRadius: scale(20),
    width: scale(44),
    height: scale(44),
    justifyContent: "center",
    alignItems: "center",
  },
  iconPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(12),
  },
  imageWrapper: {
    position: "absolute",
    left: scale(8),
    bottom: scale(8),
  },
  deleteImageIcon: {
    position: "absolute",
    right: scale(-8),
    top: scale(-8),
    zIndex: 1,
  },
  recordingStatus: {
    ...fontStyles.caption,
    position: "absolute",
    right: scale(12),
    bottom: scale(56),
  },
});

export default LogMealTrueSheet;
