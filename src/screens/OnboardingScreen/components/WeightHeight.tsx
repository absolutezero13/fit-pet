import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  StyleSheet,
} from "react-native";
import maleStandingPerson from "../../assets/male-person-standing.png";
import nonbinaryStandingPerson from "../../assets/nonbinary-person-standing.png";
import femaleStandingPerson from "../../assets/female-person-standing.png";
import * as Haptics from "expo-haptics";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { IS_SMALL_SCREEN, scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore, {
  GenderEnum,
} from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";

const imageMapping: Record<GenderEnum, ImageSourcePropType> = {
  [GenderEnum.Female]: femaleStandingPerson,
  [GenderEnum.Male]: maleStandingPerson,
  [GenderEnum.Other]: nonbinaryStandingPerson,
};

const BASE_IMAGE_HEIGHT = IS_SMALL_SCREEN ? scale(200) : scale(280);
const BASE_IMAGE_WIDTH = scale(120);

const heightData = Array.from({ length: 120 })
  .fill(0)
  .map((_, i) => i + 130);

const weightData = Array.from({ length: 160 })
  .fill(0)
  .map((_, i) => i + 40);

// Calculate scaling factors
const getHeightScale = (height: number | null) => {
  if (!height) return 1;
  // Map height from 130-250cm to scale 0.85-1.15
  const normalized = (height - 130) / (250 - 130);
  return 0.85 + normalized * 0.3;
};

const getWeightScale = (weight: number | null) => {
  if (!weight) return 1;
  // Map weight from 40-200kg to scale 0.85-1.15
  const normalized = (weight - 40) / (200 - 80);
  return 0.85 + normalized * 0.3;
};

const WeightHeight = () => {
  const { height, weight, gender } = useOnboardingStore();

  const onHeightValueChange = (itemValue: number) => {
    if (itemValue !== height) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useOnboardingStore.setState({ height: itemValue });
    }
  };

  const onWeightValueChange = (itemValue: number) => {
    if (itemValue !== weight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useOnboardingStore.setState({ weight: itemValue });
    }
  };

  const imageWidth = BASE_IMAGE_WIDTH * getWeightScale(weight ?? null);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={imageMapping[gender || GenderEnum.Female]}
          resizeMode="stretch"
          style={[
            {
              width: imageWidth,
              height: BASE_IMAGE_HEIGHT,
            },
          ]}
        />
      </View>

      <View style={styles.pickersContainer}>
        <View style={styles.pickerCard}>
          <Text style={styles.cardLabel}>Height</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={height ?? undefined}
              onValueChange={onHeightValueChange}
              style={styles.picker}
              enabled={true}
              mode="dropdown"
              selectionColor={colors["color-primary-500"]}
              dropdownIconColor={colors["color-primary-500"]}
              itemStyle={styles.pickerItem}
            >
              {heightData.map((value) => (
                <Picker.Item
                  key={value.toString()}
                  label={value.toString()}
                  value={value}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>cm</Text>
            </View>
          </View>
        </View>

        <View style={styles.pickerCard}>
          <Text style={styles.cardLabel}>Weight</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={weight ?? undefined}
              onValueChange={onWeightValueChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              enabled={true}
              mode="dropdown"
              selectionColor={colors["color-primary-500"]}
              dropdownIconColor={colors["color-primary-500"]}
            >
              {weightData.map((value) => (
                <Picker.Item
                  key={value.toString()}
                  label={value.toString()}
                  value={value}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>kg</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pickersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(16),
  },
  pickerCard: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(16),
    padding: scale(16),
    ...shadowStyle,
  },
  cardLabel: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
    marginBottom: scale(12),
    textAlign: "center",
  },
  pickerWrapper: {
    position: "relative",
    borderRadius: scale(12),
    overflow: "hidden",
    minHeight: scale(56),
    justifyContent: "center",
  },
  selectedValue: {
    position: "absolute",
    left: scale(16),
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    zIndex: 1,
    pointerEvents: "none",
  },
  picker: {
    width: "100%",
    height: scale(205),
    color: "transparent",
  },
  pickerItem: {
    color: colors["color-primary-500"],
    fontSize: scale(20),
    fontFamily: "Nunito_700Bold",
  },
  unitContainer: {
    position: "absolute",
    right: scale(16),
    top: scale(3),
    bottom: 0,
    justifyContent: "center",
    pointerEvents: "none",
  },
  unitLabel: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
});

export default WeightHeight;
