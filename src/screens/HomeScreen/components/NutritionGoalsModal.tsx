import React, { FC } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Slider from "@react-native-community/slider";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import AppButton from "../../../components/AppButton";
import GlassView from "../../../components/SafeGlassView";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";
import getMacroConfig from "../../../utils/getMacroConfig";
import { MacroGoals } from "../../../zustand/useUserStore";

type NutritionGoalsModalProps = {
  visible: boolean;
  onClose: () => void;
  goals: MacroGoals;
  setGoals: React.Dispatch<React.SetStateAction<MacroGoals>>;
  onSave: () => void;
};

type MacroSummaryCardProps = {
  type: "protein" | "carbs" | "fats";
  percentage: number;
  grams: number;
};

const CALORIE_MIN = 1000;
const CALORIE_MAX = 5000;
const PROTEIN_MIN = 10;
const PROTEIN_MAX = 60;

const getMacroGrams = (
  calories: number,
  percentage: number,
  kcalPerGram: number,
) => Math.round((calories * percentage) / 100 / kcalPerGram);

const MacroSummaryCard = ({
  type,
  percentage,
  grams,
}: MacroSummaryCardProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const config = getMacroConfig(type);
  const styles = makeStyles(colors, isDark);

  return (
    <View
      style={[
        styles.macroSummaryCard,
        {
          borderColor: `${config.color}33`,
        },
      ]}
    >
      <View
        style={[
          styles.macroSummaryIconWrap,
          { backgroundColor: colors.surface },
        ]}
      >
        <Icon name={config.icon} size={scale(18)} color={config.color} />
      </View>

      <Text style={[styles.macroSummaryLabel, { color: colors.textSecondary }]}>
        {t(config.labelKey)}
      </Text>
      <Text style={[styles.macroSummaryPercent, { color: config.color }]}>
        {percentage}%
      </Text>
      <Text style={[styles.macroSummaryGrams, { color: colors.text }]}>
        {grams} g
      </Text>
    </View>
  );
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

  const calorieConfig = getMacroConfig("calories");
  const proteinConfig = getMacroConfig("protein");
  const proteinGrams = getMacroGrams(goals.calories, goals.proteins, 4);
  const carbsGrams = getMacroGrams(goals.calories, goals.carbs, 4);
  const fatsGrams = getMacroGrams(goals.calories, goals.fats, 9);

  const handleCaloriesChange = (value: number) => {
    setGoals((currentGoals) => ({
      ...currentGoals,
      calories: Math.round(value),
    }));
  };

  const handleProteinChange = (value: number) => {
    const nextProteins = Math.round(value);
    const remainingPercentage = 100 - nextProteins;
    const nextCarbs = Math.round(remainingPercentage * 0.6);
    const nextFats = remainingPercentage - nextCarbs;

    setGoals((currentGoals) => ({
      ...currentGoals,
      proteins: nextProteins,
      carbs: nextCarbs,
      fats: nextFats,
    }));
  };

  const styles = makeStyles(colors, isDark);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.68)"
              : "rgba(10, 14, 20, 0.28)",
          },
        ]}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("nutritionGoals")}
              </Text>

              <GlassView
                effect="clear"
                interactive
                style={styles.closeButtonShell}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.85}
                  hitSlop={12}
                  onPress={onClose}
                  style={styles.closeButtonInner}
                >
                  <Icon name="close" size={scale(20)} color={colors.text} />
                </TouchableOpacity>
              </GlassView>
            </View>
          </View>

          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroInfo}>
                <View
                  style={[
                    styles.heroIconWrap,
                    { backgroundColor: calorieConfig.background },
                  ]}
                >
                  <Icon
                    name={calorieConfig.icon}
                    size={scale(22)}
                    color={calorieConfig.color}
                  />
                </View>

                <View style={styles.heroCopy}>
                  <Text style={[styles.heroLabel, { color: colors.text }]}>
                    {t("calories")}
                  </Text>
                  <Text
                    style={[
                      styles.heroSubLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("dailyGoal")}
                  </Text>
                </View>
              </View>

              <View style={styles.heroValueWrap}>
                <Text style={[styles.heroValue, { color: colors.text }]}>
                  {goals.calories}
                </Text>
                <Text
                  style={[styles.heroUnit, { color: colors.textSecondary }]}
                >
                  kcal
                </Text>
              </View>
            </View>

            <Slider
              style={styles.slider}
              value={goals.calories}
              minimumValue={CALORIE_MIN}
              maximumValue={CALORIE_MAX}
              step={10}
              onValueChange={handleCaloriesChange}
              minimumTrackTintColor={calorieConfig.color}
              maximumTrackTintColor={colors.border}
              thumbTintColor={calorieConfig.color}
            />

            <View style={styles.rangeRow}>
              <Text
                style={[styles.rangeLabel, { color: colors.textSecondary }]}
              >
                {CALORIE_MIN}
              </Text>
              <Text
                style={[styles.rangeLabel, { color: colors.textSecondary }]}
              >
                {CALORIE_MAX}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionInfo}>
                <View
                  style={[
                    styles.sectionIconWrap,
                    { backgroundColor: proteinConfig.background },
                  ]}
                >
                  <Icon
                    name={proteinConfig.icon}
                    size={scale(20)}
                    color={proteinConfig.color}
                  />
                </View>

                <View style={styles.sectionCopy}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("proteins")}
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {proteinGrams} g
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.percentPill,
                  { backgroundColor: proteinConfig.background },
                ]}
              >
                <Text
                  style={[
                    styles.percentPillText,
                    { color: proteinConfig.color },
                  ]}
                >
                  {goals.proteins}%
                </Text>
              </View>
            </View>

            <Slider
              style={styles.slider}
              value={goals.proteins}
              minimumValue={PROTEIN_MIN}
              maximumValue={PROTEIN_MAX}
              step={1}
              onValueChange={handleProteinChange}
              minimumTrackTintColor={proteinConfig.color}
              maximumTrackTintColor={colors.border}
              thumbTintColor={proteinConfig.color}
            />

            <View style={styles.rangeRow}>
              <Text
                style={[styles.rangeLabel, { color: colors.textSecondary }]}
              >
                {PROTEIN_MIN}%
              </Text>
              <Text
                style={[styles.rangeLabel, { color: colors.textSecondary }]}
              >
                {PROTEIN_MAX}%
              </Text>
            </View>

            <View style={styles.macroSummaryRow}>
              <MacroSummaryCard
                type="protein"
                percentage={goals.proteins}
                grams={proteinGrams}
              />
              <MacroSummaryCard
                type="carbs"
                percentage={goals.carbs}
                grams={carbsGrams}
              />
              <MacroSummaryCard
                type="fats"
                percentage={goals.fats}
                grams={fatsGrams}
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <AppButton title={t("save")} onPress={onSave} />
            <AppButton variant="text" title={t("cancel")} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  isDark: boolean,
) =>
  StyleSheet.create({
    modalContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      padding: scale(20),
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: scale(32),
      elevation: 10,
      maxWidth: scale(460),
      padding: scale(22),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: scale(10) },
      shadowOpacity: isDark ? 0.34 : 0.16,
      shadowRadius: scale(28),
      width: "100%",
    },
    header: {
      marginBottom: scale(18),
    },
    headerTopRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: scale(8),
    },
    modalTitle: {
      ...fontStyles.headline2,
      flex: 1,
      paddingRight: scale(12),
    },
    modalSubtitle: {
      ...fontStyles.body2,
      paddingRight: scale(44),
    },
    closeButtonShell: {
      borderRadius: scale(18),
      height: scale(36),
      width: scale(36),
    },
    closeButtonInner: {
      alignItems: "center",
      borderRadius: scale(18),
      height: scale(36),
      justifyContent: "center",
      width: scale(36),
    },
    heroCard: {
      borderRadius: scale(24),
      elevation: 4,
      marginBottom: scale(14),
      padding: scale(18),
      shadowOffset: { width: 0, height: scale(5) },
      shadowOpacity: isDark ? 0.24 : 0.08,
      shadowRadius: scale(16),
    },
    heroTopRow: {
      alignItems: "center",
      flexDirection: "row",
      marginBottom: scale(10),
    },
    heroInfo: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      minWidth: 0,
    },
    heroIconWrap: {
      alignItems: "center",
      borderRadius: scale(18),
      height: scale(44),
      justifyContent: "center",
      marginRight: scale(12),
      width: scale(44),
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    heroLabel: {
      ...fontStyles.headline4,
    },
    heroSubLabel: {
      ...fontStyles.caption,
      letterSpacing: scale(0.7),
      marginTop: scale(2),
      textTransform: "uppercase",
    },
    heroValueWrap: {
      alignItems: "baseline",
      flexDirection: "row",
      marginLeft: scale(12),
    },
    heroValue: {
      fontSize: scale(34),
      fontVariant: ["tabular-nums"],
      fontWeight: "700",
      lineHeight: scale(40),
    },
    heroUnit: {
      ...fontStyles.body2,
      marginLeft: scale(4),
    },
    sectionCard: {
      borderRadius: scale(24),
      elevation: 4,
      marginBottom: scale(18),
      padding: scale(18),
      shadowOffset: { width: 0, height: scale(5) },
      shadowOpacity: isDark ? 0.24 : 0.08,
      shadowRadius: scale(16),
    },
    sectionHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: scale(10),
    },
    sectionInfo: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      minWidth: 0,
    },
    sectionIconWrap: {
      alignItems: "center",
      borderRadius: scale(16),
      height: scale(40),
      justifyContent: "center",
      marginRight: scale(12),
      width: scale(40),
    },
    sectionCopy: {
      flex: 1,
      minWidth: 0,
    },
    sectionTitle: {
      ...fontStyles.headline4,
    },
    sectionSubtitle: {
      ...fontStyles.body2,
      fontVariant: ["tabular-nums"],
      marginTop: scale(2),
    },
    percentPill: {
      borderRadius: scale(16),
      marginLeft: scale(12),
      paddingHorizontal: scale(12),
      paddingVertical: scale(8),
    },
    percentPillText: {
      ...fontStyles.body1Bold,
      fontVariant: ["tabular-nums"],
    },
    slider: {
      height: scale(34),
      width: "100%",
    },
    rangeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: scale(14),
      marginTop: scale(-2),
    },
    rangeLabel: {
      ...fontStyles.caption,
      fontVariant: ["tabular-nums"],
    },
    macroSummaryRow: {
      flexDirection: "row",
      gap: scale(10),
    },
    macroSummaryCard: {
      alignItems: "center",
      borderRadius: scale(20),
      borderWidth: 1,
      flex: 1,
      minHeight: scale(116),
      paddingHorizontal: scale(10),
      paddingVertical: scale(14),
    },
    macroSummaryIconWrap: {
      alignItems: "center",
      borderRadius: scale(14),
      height: scale(36),
      justifyContent: "center",
      marginBottom: scale(10),
      width: scale(36),
    },
    macroSummaryLabel: {
      ...fontStyles.caption,
      marginBottom: scale(6),
      textAlign: "center",
    },
    macroSummaryPercent: {
      ...fontStyles.headline4,
      fontVariant: ["tabular-nums"],
      marginBottom: scale(2),
    },
    macroSummaryGrams: {
      ...fontStyles.body2,
      fontVariant: ["tabular-nums"],
    },
    actionRow: {
      gap: scale(6),
    },
  });

export default NutritionGoalsModal;
