import { Text, View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
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

const calculateBMI = (weight: number | null, height: number | null) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: "Underweight", color: colors["color-info-500"] };
  if (bmi < 25) return { label: "Normal", color: colors["color-success-500"] };
  if (bmi < 30) return { label: "Overweight", color: colors["color-warning-500"] };
  return { label: "Obese", color: colors["color-danger-500"] };
};

const WeightHeight = () => {
  const { t } = useTranslation();
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

  const bmi = calculateBMI(weight ?? null, height ?? null);
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <View style={styles.container}>
      <View style={styles.pickersContainer}>
        <View style={styles.pickerCard}>
          <Text style={styles.cardLabel}>{t("height")}</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={height ?? undefined}
              onValueChange={onHeightValueChange}
              style={
                Platform.OS === "android" ? styles.pickerAndroid : styles.picker
              }
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
          <Text style={styles.cardLabel}>{t("weight")}</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={weight ?? undefined}
              onValueChange={onWeightValueChange}
              style={
                Platform.OS === "android" ? styles.pickerAndroid : styles.picker
              }
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

      {bmi && bmiCategory && (
        <View style={styles.bmiCard}>
          <Text style={styles.bmiTitle}>{t("yourBMI")}</Text>
          <View style={styles.bmiValueContainer}>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
            <View
              style={[
                styles.bmiCategoryBadge,
                { backgroundColor: bmiCategory.color },
              ]}
            >
              <Text style={styles.bmiCategoryText}>{bmiCategory.label}</Text>
            </View>
          </View>
          <View style={styles.bmiScale}>
            <View style={[styles.bmiScaleSection, styles.bmiUnderweight]} />
            <View style={[styles.bmiScaleSection, styles.bmiNormal]} />
            <View style={[styles.bmiScaleSection, styles.bmiOverweight]} />
            <View style={[styles.bmiScaleSection, styles.bmiObese]} />
          </View>
          <View style={styles.bmiLabels}>
            <Text style={styles.bmiLabelText}>18.5</Text>
            <Text style={styles.bmiLabelText}>25</Text>
            <Text style={styles.bmiLabelText}>30</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
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
  picker: {
    width: "100%",
    height: scale(205),
    color: "transparent",
  },
  pickerAndroid: {
    height: scale(50),
  },
  pickerItem: {
    color: colors["color-primary-500"],
    fontSize: scale(20),
    fontFamily: "Nunito_700Bold",
  },
  unitContainer: {
    position: "absolute",
    right: scale(Platform.OS === "android" ? 56 : 16),
    top: scale(Platform.OS === "android" ? 8 : 3),
    bottom: 0,
    justifyContent: "center",
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
    padding: scale(20),
    ...shadowStyle,
  },
  bmiTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-100"],
    textAlign: "center",
    marginBottom: scale(12),
  },
  bmiValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(12),
    marginBottom: scale(16),
  },
  bmiValue: {
    ...fontStyles.hero,
    color: colors["color-primary-100"],
  },
  bmiCategoryBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  bmiCategoryText: {
    ...fontStyles.body1Bold,
    color: colors["color-primary-100"],
  },
  bmiScale: {
    flexDirection: "row",
    height: scale(8),
    borderRadius: scale(4),
    overflow: "hidden",
    marginBottom: scale(8),
  },
  bmiScaleSection: {
    flex: 1,
  },
  bmiUnderweight: {
    backgroundColor: colors["color-info-500"],
  },
  bmiNormal: {
    backgroundColor: colors["color-success-500"],
  },
  bmiOverweight: {
    backgroundColor: colors["color-warning-500"],
  },
  bmiObese: {
    backgroundColor: colors["color-danger-500"],
  },
  bmiLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
  },
  bmiLabelText: {
    ...fontStyles.caption,
    color: colors["color-primary-300"],
  },
});

export default WeightHeight;
