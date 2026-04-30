import { scale } from "../../../theme/utils";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import AppButton from "../../../components/AppButton";
import { t } from "i18next";
import { LinearGradient } from "expo-linear-gradient";
import { PhotoFile } from "react-native-vision-camera";
import MealTypes from "./MealTypes";
import { fontStyles } from "../../../theme/fontStyles";

type ScanMealCapturedStepProps = {
  photo: PhotoFile;
  photoUri: string;
  loading: boolean;
  selectedMealType: string;
  onSelectedMealTypeChange: (value: string) => void;
  onAnalyze: () => void;
  onRetake: () => void;
};

const ScanMealCapturedStep = (props: ScanMealCapturedStepProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.capturedContainer}>
      <View style={styles.capturedImageWrapper}>
        <Image source={{ uri: props.photoUri }} style={styles.capturedPhoto} />
        <LinearGradient
          colors={["transparent", colors.background]}
          style={styles.capturedGradientOverlay}
        />
        <Pressable
          disabled={props.loading}
          onPress={props.onRetake}
          style={[
            styles.retakeButton,
            {
              backgroundColor: colors.surface,
              opacity: props.loading ? 0.5 : 1,
            },
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
            selectedMealType={props.selectedMealType}
            setSelectedMealType={props.onSelectedMealTypeChange}
          />
        </View>

        <AppButton
          title={t("analyzeMeal")}
          onPress={props.onAnalyze}
          disabled={props.loading}
          margin={{ marginTop: scale(16) }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "red",
  },
  capturedGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
    flex: 1,
  },
  capturedTitle: {
    ...fontStyles.headline2,
    marginBottom: scale(6),
  },
  capturedMealTypeContainer: {
    marginBottom: scale(8),
  },
});

export default ScanMealCapturedStep;
