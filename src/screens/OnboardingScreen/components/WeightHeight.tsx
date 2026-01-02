import { Text, View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";

const heightData = Array.from({ length: 120 })
  .fill(0)
  .map((_, i) => i + 130);

const weightData = Array.from({ length: 160 })
  .fill(0)
  .map((_, i) => i + 40);

const WeightHeight = () => {
  const { height, weight } = useOnboardingStore();

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

  const bmi =
    height && weight
      ? Number((weight / Math.pow(height / 100, 2)).toFixed(1))
      : null;

  const bmiCategory =
    bmi === null
      ? null
      : bmi < 18.5
      ? "Underweight"
      : bmi < 25
      ? "Healthy"
      : bmi < 30
      ? "Overweight"
      : "Obese";

  const renderPicker = (
    label: string,
    data: number[],
    selected: number | null,
    onChange: (value: number) => void,
    unit: string
  ) => (
    <View style={styles.pickerCard}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selected ?? undefined}
          onValueChange={onChange}
          style={
            Platform.OS === "android" ? styles.pickerAndroid : styles.picker
          }
          enabled={true}
          mode={Platform.OS === "ios" ? "dialog" : "dropdown"}
          selectionColor={colors["color-primary-500"]}
          dropdownIconColor={colors["color-primary-500"]}
          itemStyle={styles.pickerItem}
        >
          {data.map((value) => (
            <Picker.Item
              key={value.toString()}
              label={value.toString()}
              value={value}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
        <View style={styles.unitContainer}>
          <Text style={styles.unitLabel}>{unit}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.pickersContainer}>
        {renderPicker("Height", heightData, height, onHeightValueChange, "cm")}
        {renderPicker("Weight", weightData, weight, onWeightValueChange, "kg")}
      </View>

      {bmi !== null && (
        <View style={styles.bmiCard}>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={styles.bmiValue}>{bmi}</Text>
          {bmiCategory ? (
            <Text style={styles.bmiCategory}>{bmiCategory}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: "center",
  },
  pickersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(16),
    marginTop: scale(32),
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
    minHeight: scale(120),
    justifyContent: "center",
    backgroundColor: colors["color-primary-50"],
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
    height: scale(220),
    color: colors["color-primary-500"],
  },
  pickerAndroid: {
    height: scale(140),
  },
  pickerItem: {
    color: colors["color-primary-500"],
    fontSize: scale(20),
    fontFamily: "Nunito_700Bold",
  },
  unitContainer: {
    position: "absolute",
    right: scale(Platform.OS === "android" ? 20 : 16),
    top: scale(Platform.OS === "android" ? 8 : 3),
    bottom: scale(8),
    justifyContent: "flex-start",
    pointerEvents: "none",
  },
  unitLabel: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
  bmiCard: {
    position: "absolute",
    bottom: scale(96),
    left: scale(24),
    right: scale(24),
    backgroundColor: colors["color-primary-500"],
    borderRadius: scale(16),
    paddingVertical: scale(16),
    paddingHorizontal: scale(20),
    ...shadowStyle,
  },
  bmiLabel: {
    ...fontStyles.headline4,
    color: colors["color-primary-100"],
    textAlign: "center",
  },
  bmiValue: {
    ...fontStyles.headline1,
    color: colors["color-primary-50"],
    textAlign: "center",
    marginTop: scale(8),
  },
  bmiCategory: {
    ...fontStyles.body1,
    color: colors["color-primary-100"],
    textAlign: "center",
    marginTop: scale(6),
  },
});

export default WeightHeight;
