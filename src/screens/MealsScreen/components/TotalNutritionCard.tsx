import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { IMeal } from "../../../services/apiTypes";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TotalNutrition = ({ meals }: { meals: IMeal[] }) => {
  const { t } = useTranslation();
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + parseInt(meal.calories),
          proteins: acc.proteins + parseInt(meal.proteins),
          carbs: acc.carbs + parseInt(meal.carbs),
          fats: acc.fats + parseInt(meal.fats),
        };
      },
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );
  }, [meals]);

  return (
    <View style={styles.totalCard}>
      <View style={styles.totalHeaderRow}>
        <MaterialCommunityIcons
          name="calculator"
          size={scale(24)}
          color={colors["color-info-400"]}
          style={styles.totalIcon}
        />
        <Text style={styles.totalTitle}>{t("dailyTotal")}</Text>
      </View>

      <View style={styles.totalMacrosContainer}>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.calories}</Text>
          <Text style={styles.totalMacroLabel}>{t("calories")}</Text>
        </View>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.proteins}g</Text>
          <Text style={styles.totalMacroLabel}>{t("proteins")}</Text>
        </View>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.carbs}g</Text>
          <Text style={styles.totalMacroLabel}>{t("carbs")} </Text>
        </View>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.fats}g</Text>
          <Text style={styles.totalMacroLabel}>{t("fats")} </Text>
        </View>
      </View>

      <View style={styles.macroPercentagesContainer}>
        <View style={styles.macroPercentageBar}>
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${Math.round(
                  ((totals.proteins * 4) / totals.calories) * 100
                )}%`,
                backgroundColor: colors["color-success-400"],
              },
            ]}
          />
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${Math.round(
                  ((totals.carbs * 4) / totals.calories) * 100
                )}%`,
                backgroundColor: colors["color-info-400"],
              },
            ]}
          />
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${Math.round(
                  ((totals.fats * 9) / totals.calories) * 100
                )}%`,
                backgroundColor: colors["color-primary-400"],
              },
            ]}
          />
        </View>
        <View style={styles.macroLegendContainer}>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-success-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>
              {t("proteins").toUpperCase()}
            </Text>
          </View>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-info-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>
              {t("carbs").toUpperCase()}
            </Text>
          </View>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-primary-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>
              {t("fats").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TotalNutrition;

const styles = StyleSheet.create({
  // Total Card Styles
  totalCard: {
    backgroundColor: "white",
    borderRadius: scale(24),
    padding: scale(24),
    marginBottom: scale(24),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(12),
    elevation: 5,
  },
  totalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(20),
  },
  totalIcon: {
    marginRight: scale(12),
  },
  totalTitle: {
    ...fontStyles.headline2,
    color: colors["color-info-500"],
  },
  totalMacrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(24),
  },
  totalMacroItem: {
    flex: 1,
    alignItems: "center",
  },
  totalMacroValue: {
    ...fontStyles.headline2,
    color: colors["color-info-500"],
    marginBottom: scale(6),
  },
  totalMacroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    textTransform: "uppercase",
  },
  macroPercentagesContainer: {
    marginTop: scale(8),
  },
  macroPercentageBar: {
    height: scale(16),
    flexDirection: "row",
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(8),
    overflow: "hidden",
    marginBottom: scale(16),
  },
  macroPercentageFill: {
    height: "100%",
  },
  macroLegendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: scale(8),
  },
  macroLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: scale(10),
  },
  macroLegendColor: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: scale(6),
  },
  macroLegendText: {
    ...fontStyles.footnote,
    color: colors["color-primary-400"],
  },
});
