import React, { FC } from "react";
import { View, StyleSheet, Text, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import getMacroConfig from "../../../utils/getMacroConfig";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { MacroGoals } from "../../../zustand/useUserStore";
import Slider from "@react-native-community/slider";
import AppButton from "../../../components/AppButton";
import { useTheme } from "../../../theme/ThemeContext";

type NutritionGoalsModalProps = {
  visible: boolean;
  onClose: () => void;
  goals: MacroGoals;
  setGoals: React.Dispatch<React.SetStateAction<MacroGoals>>;
  onSave: () => void;
};

const NutritionGoalsModal: FC<NutritionGoalsModalProps> = ({
  visible,
  onClose,
  goals,
  setGoals,
  onSave,
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(0, 0, 0, 0.3)",
          },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t("nutritionGoals")}
          </Text>

          <View
            style={[
              styles.calorieModalCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.calorieIconContainer,
                { backgroundColor: getMacroConfig("calories").background },
              ]}
            >
              <Icon
                name={getMacroConfig("calories").icon}
                size={scale(24)}
                color={getMacroConfig("calories").color}
              />
            </View>
            <View style={styles.calorieLabelContainer}>
              <Text style={[styles.calorieCardLabel, { color: colors.text }]}>
                {t("calories")}
              </Text>
              <Text
                style={[
                  styles.calorieSublabel,
                  { color: getMacroConfig("protein").color },
                ]}
              >
                {t("dailyGoal")}
              </Text>
            </View>
            <View style={styles.calorieValueContainer}>
              <Text style={[styles.calorieCardValue, { color: colors.text }]}>
                {goals.calories}
              </Text>
              <Text
                style={[styles.calorieUnit, { color: colors.textSecondary }]}
              >
                kcal
              </Text>
            </View>
          </View>

          <Slider
            style={styles.slider}
            value={goals.calories}
            minimumValue={1000}
            maximumValue={5000}
            step={10}
            onValueChange={(value) =>
              setGoals((prev) => ({ ...prev, calories: Math.round(value) }))
            }
            minimumTrackTintColor={getMacroConfig("calories").color}
            maximumTrackTintColor={colors.border}
            thumbTintColor={getMacroConfig("calories").color}
          />

          <View style={styles.sliderRow}>
            <View
              style={[
                styles.sliderIconContainer,
                { backgroundColor: getMacroConfig("protein").background },
              ]}
            >
              <Icon
                name={getMacroConfig("protein").icon}
                size={scale(20)}
                color={getMacroConfig("protein").color}
              />
            </View>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>
              {t("proteins")}
            </Text>
            <Text style={[styles.sliderGrams, { color: colors.textSecondary }]}>
              {((goals.proteins * goals.calories) / 100 / 4).toFixed(0)} g
            </Text>
            <Text
              style={[
                styles.sliderPercent,
                { color: getMacroConfig("protein").color },
              ]}
            >
              {goals.proteins}%
            </Text>
          </View>

          <Slider
            style={styles.slider}
            value={goals.proteins}
            minimumValue={10}
            maximumValue={60}
            step={1}
            onValueChange={(value) =>
              setGoals((prev) => ({
                ...prev,
                proteins: Math.round(value),
                carbs: Math.round((100 - Math.round(value)) * 0.6),
                fats: Math.round((100 - Math.round(value)) * 0.4),
              }))
            }
            minimumTrackTintColor={getMacroConfig("protein").color}
            maximumTrackTintColor={colors.border}
            thumbTintColor={getMacroConfig("protein").color}
          />

          <View style={styles.otherRow}>
            <View
              style={[
                styles.otherIconContainer,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Icon
                name="circle-half-full"
                size={scale(20)}
                color={colors.textSecondary}
              />
            </View>
            <Text style={[styles.otherLabel, { color: colors.text }]}>
              {t("otherCarbsFat")}
            </Text>
            <Text
              style={[styles.otherPercent, { color: colors.textSecondary }]}
            >
              {100 - goals.proteins}%
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <AppButton
              title={t("save")}
              onPress={onSave}
              backgroundColor={colors["color-success-400"]}
            />
            <AppButton variant="text" title={t("cancel")} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContent: {
    borderRadius: scale(24),
    padding: scale(24),
    width: "100%",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 8,
  },
  modalTitle: {
    ...fontStyles.headline2,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: scale(20),
  },
  calorieModalCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: scale(24),
  },
  calorieIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  calorieLabelContainer: {
    flex: 1,
  },
  calorieCardLabel: {
    ...fontStyles.body1,
    fontWeight: "600",
  },
  calorieSublabel: {
    ...fontStyles.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calorieValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  calorieCardValue: {
    ...fontStyles.headline1,
    fontWeight: "300",
    fontSize: scale(36),
  },
  calorieUnit: {
    ...fontStyles.body2,
    marginLeft: scale(4),
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(8),
  },
  sliderIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  sliderLabel: {
    ...fontStyles.body1,
    fontWeight: "500",
    flex: 1,
  },
  sliderGrams: {
    ...fontStyles.body2,
    marginRight: scale(8),
  },
  sliderPercent: {
    ...fontStyles.body1,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: scale(40),
    marginBottom: scale(16),
  },
  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(24),
  },
  otherIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  otherLabel: {
    ...fontStyles.body1,
    fontWeight: "500",
    flex: 1,
  },
  otherPercent: {
    ...fontStyles.body1,
    fontWeight: "600",
  },
  modalButtons: {
    gap: scale(12),
  },
});

export default NutritionGoalsModal;
