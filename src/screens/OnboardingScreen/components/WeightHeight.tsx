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
import { IS_SMALL_SCREEN, scale } from "../../../theme/utils";
import useOnboardingStore, {
  GenderEnum,
} from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";

const imageMapping: Record<GenderEnum, ImageSourcePropType> = {
  [GenderEnum.Female]: femaleStandingPerson,
  [GenderEnum.Male]: maleStandingPerson,
  [GenderEnum.Other]: nonbinaryStandingPerson,
};

const LIST_HEIGHT = IS_SMALL_SCREEN ? scale(250) : scale(350);

const heightData = Array.from({ length: 120 })
  .fill(0)
  .map((_, i) => i + 130);

const weightData = Array.from({ length: 160 })
  .fill(0)
  .map((_, i) => i + 40);

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

  return (
    <View style={styles.container}>
      <Image
        source={imageMapping[gender || GenderEnum.Female]}
        style={styles.personImage}
      />

      <View style={styles.pickersContainer}>
        <View style={styles.pickerColumn}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={height ?? undefined}
              onValueChange={onHeightValueChange}
              style={styles.picker}
              enabled={true}
              mode="dropdown"
              selectionColor={colors["color-primary-900"]}
            >
              {heightData.map((value) => (
                <Picker.Item
                  key={value.toString()}
                  label={value.toString()}
                  value={value}
                  style={styles.pickerLabel}
                />
              ))}
            </Picker>
            <Text style={styles.pickerLabel}>cm</Text>
          </View>
        </View>

        <View style={styles.pickerColumn}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={weight ?? undefined}
              onValueChange={onWeightValueChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              enabled={true}
              mode="dropdown"
            >
              {weightData.map((value) => (
                <Picker.Item
                  key={value.toString()}
                  label={value.toString()}
                  value={value}
                  style={styles.pickerLabel}
                />
              ))}
            </Picker>
            <Text style={styles.pickerLabel}>kg</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  personImage: {
    aspectRatio: 1 / 2,
    height: LIST_HEIGHT,
    resizeMode: "contain",
    alignSelf: "center",
    position: "absolute",
    top: scale(64),
  },
  pickersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: scale(LIST_HEIGHT + 40),
  },
  pickerColumn: {
    alignItems: "center",
    width: "45%",
  },
  pickerLabel: {
    ...fontStyles.headline1,
    marginBottom: scale(8),
    position: "absolute",
    right: scale(48),
    top: scale(14),
  },
  pickerWrapper: {
    width: "100%",
    overflow: "hidden",
    borderRadius: scale(8),
    backgroundColor: colors["color-primary-100"],
    paddingLeft: scale(8),
  },
  picker: {
    width: "100%",
  },
  pickerItem: {
    color: colors["color-primary-900"],
    fontSize: scale(18),
  },
});

export default WeightHeight;
