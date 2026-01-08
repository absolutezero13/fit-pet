import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../theme/utils";
import { fontStyles } from "../../theme/fontStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { useTheme } from "../../theme/ThemeContext";
import CustomCalendar from "./components/CustomCalendar";
import NutritionChart from "./components/NutritionChart";
import DayMealsList from "./components/DayMealsList";
import { IMeal } from "../../services/apiTypes";
import { getMealsByDate } from "../../services/mealAnalysis";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type ViewMode = "calendar" | "chart";
type ChartPeriod = "weekly" | "monthly";
type ChartDataType = "calories" | "proteins" | "carbs" | "fats";

const HistoryScreen = () => {
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("weekly");
  const [chartDataType, setChartDataType] = useState<ChartDataType>("calories");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch meals for selected date (calendar view)
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchMealsForDate(selectedDate);
    }
  }, [selectedDate, viewMode]);

  const fetchMealsForDate = async (date: Date) => {
    try {
      setLoading(true);
      const fetchedMeals = await getMealsByDate(date.toISOString());
      setMeals(fetchedMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const chartDataTypes: { key: ChartDataType; label: string; color: string }[] =
    [
      { key: "calories", label: t("calories"), color: colors["color-warning-500"] },
      { key: "proteins", label: t("proteins"), color: colors["color-success-500"] },
      { key: "carbs", label: t("carbs"), color: colors["color-info-500"] },
      { key: "fats", label: t("fats"), color: "#FF7043" },
    ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect="clear"
        style={[
          styles.header,
          {
            paddingTop: top,
            backgroundColor: isLiquidGlassSupported
              ? undefined
              : colors.backgroundSecondary,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t("history")}
        </Text>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: colors.backgroundSecondary },
              viewMode === "calendar" && {
                backgroundColor: colors["color-success-400"],
              },
            ]}
            onPress={() => setViewMode("calendar")}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={scale(20)}
              color={viewMode === "calendar" ? colors.textInverse : colors.text}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    viewMode === "calendar" ? colors.textInverse : colors.text,
                },
              ]}
            >
              {t("calendarView")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: colors.backgroundSecondary },
              viewMode === "chart" && {
                backgroundColor: colors["color-success-400"],
              },
            ]}
            onPress={() => setViewMode("chart")}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={scale(20)}
              color={viewMode === "chart" ? colors.textInverse : colors.text}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    viewMode === "chart" ? colors.textInverse : colors.text,
                },
              ]}
            >
              {t("chartView")}
            </Text>
          </TouchableOpacity>
        </View>
      </LiquidGlassView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: top + scale(140), paddingBottom: bottom + scale(100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "calendar" ? (
          <Animated.View
            key="calendar"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
          >
            <CustomCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              minDate={new Date(2026, 0, 1)}
            />
            <DayMealsList
              meals={meals}
              selectedDate={selectedDate}
              loading={loading}
            />
          </Animated.View>
        ) : (
          <Animated.View
            key="chart"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
          >
            {/* Chart Period Toggle */}
            <View style={styles.periodContainer}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  { backgroundColor: colors.backgroundSecondary },
                  chartPeriod === "weekly" && {
                    backgroundColor: colors["color-success-400"],
                  },
                ]}
                onPress={() => setChartPeriod("weekly")}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color:
                        chartPeriod === "weekly"
                          ? colors.textInverse
                          : colors.text,
                    },
                  ]}
                >
                  {t("weekly")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodButton,
                  { backgroundColor: colors.backgroundSecondary },
                  chartPeriod === "monthly" && {
                    backgroundColor: colors["color-success-400"],
                  },
                ]}
                onPress={() => setChartPeriod("monthly")}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color:
                        chartPeriod === "monthly"
                          ? colors.textInverse
                          : colors.text,
                    },
                  ]}
                >
                  {t("monthly")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chart Data Type Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dataTypeScroll}
              contentContainerStyle={styles.dataTypeContainer}
            >
              {chartDataTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.dataTypeButton,
                    { backgroundColor: colors.backgroundSecondary },
                    chartDataType === type.key && {
                      backgroundColor: type.color,
                    },
                  ]}
                  onPress={() => setChartDataType(type.key)}
                >
                  <Text
                    style={[
                      styles.dataTypeText,
                      {
                        color:
                          chartDataType === type.key
                            ? colors.textInverse
                            : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <NutritionChart
              period={chartPeriod}
              dataType={chartDataType}
              selectedDate={selectedDate}
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(16),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  title: {
    ...fontStyles.headline1,
    marginBottom: scale(12),
  },
  toggleContainer: {
    flexDirection: "row",
    gap: scale(12),
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    gap: scale(8),
  },
  toggleText: {
    ...fontStyles.body1Bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
  },
  periodContainer: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: scale(16),
  },
  periodButton: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(12),
    alignItems: "center",
  },
  periodText: {
    ...fontStyles.body1Bold,
  },
  dataTypeScroll: {
    marginBottom: scale(16),
  },
  dataTypeContainer: {
    flexDirection: "row",
    gap: scale(10),
  },
  dataTypeButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(20),
  },
  dataTypeText: {
    ...fontStyles.body2,
    fontWeight: "600",
  },
});

export default HistoryScreen;
