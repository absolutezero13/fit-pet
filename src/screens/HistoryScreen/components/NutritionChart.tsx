import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { Path, Line, Circle, G, Text as SvgText } from "react-native-svg";
import { scale, SCREEN_WIDTH } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { useTranslation } from "react-i18next";
import { getMealsByDate } from "../../../services/mealAnalysis";
import { IMeal } from "../../../services/apiTypes";
import { HISTORY_MIN_DATE, FATS_COLOR } from "../constants";

type ChartPeriod = "weekly" | "monthly";
type ChartDataType = "calories" | "proteins" | "carbs" | "fats";

interface NutritionChartProps {
  period: ChartPeriod;
  dataType: ChartDataType;
  selectedDate: Date;
}

interface DataPoint {
  date: Date;
  value: number;
  label: string;
}

const CHART_HEIGHT = scale(200);
const CHART_WIDTH = SCREEN_WIDTH - scale(80);
const CHART_PADDING = scale(40);

const NutritionChart: React.FC<NutritionChartProps> = ({
  period,
  dataType,
  selectedDate,
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);

  const dataTypeConfig = useMemo(() => {
    const configs: Record<
      ChartDataType,
      { color: string; unit: string; label: string }
    > = {
      calories: {
        color: colors["color-warning-500"],
        unit: "kcal",
        label: t("calories"),
      },
      proteins: {
        color: colors["color-success-500"],
        unit: "g",
        label: t("proteins"),
      },
      carbs: {
        color: colors["color-info-500"],
        unit: "g",
        label: t("carbs"),
      },
      fats: {
        color: FATS_COLOR,
        unit: "g",
        label: t("fats"),
      },
    };
    return configs[dataType];
  }, [dataType, colors, t]);

  useEffect(() => {
    fetchChartData();
  }, [period, dataType, selectedDate]);

  const getDateRange = (): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === "weekly") {
      // Get last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
      }
    } else {
      // Get last 30 days (show every 5th day for readability)
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
      }
    }
    return dates;
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const dates = getDateRange();

      const dataPoints: DataPoint[] = await Promise.all(
        dates.map(async (date) => {
          // Don't fetch data before minimum date
          if (date < HISTORY_MIN_DATE) {
            return {
              date,
              value: 0,
              label: getDateLabel(date),
            };
          }

          try {
            const meals: IMeal[] = await getMealsByDate(date.toISOString());
            const value = meals.reduce((sum, meal) => {
              return sum + Number(meal[dataType] || 0);
            }, 0);

            return {
              date,
              value,
              label: getDateLabel(date),
            };
          } catch {
            return {
              date,
              value: 0,
              label: getDateLabel(date),
            };
          }
        })
      );

      setData(dataPoints);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (date: Date): string => {
    const locale = i18n.language === "tr" ? "tr-TR" : "en-US";

    if (period === "weekly") {
      return date.toLocaleDateString(locale, { weekday: "short" }).substring(0, 3);
    } else {
      return date.getDate().toString();
    }
  };

  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], path: "", maxValue: 0 };

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const displayData = period === "monthly" ? data.filter((_, i) => i % 5 === 0 || i === data.length - 1) : data;

    const xStep = (CHART_WIDTH - CHART_PADDING * 2) / (displayData.length - 1 || 1);
    const yScale = (CHART_HEIGHT - CHART_PADDING * 2) / maxValue;

    const points = displayData.map((point, index) => ({
      x: CHART_PADDING + index * xStep,
      y: CHART_HEIGHT - CHART_PADDING - point.value * yScale,
      value: point.value,
      label: point.label,
    }));

    // Generate smooth curve path
    if (points.length < 2) {
      return { points, path: "", maxValue };
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` Q ${cpx} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`;
      path += ` Q ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return { points, path, maxValue };
  }, [data, period]);

  const { average, total } = useMemo(() => {
    const validData = data.filter((d) => d.value > 0);
    if (validData.length === 0) return { average: 0, total: 0 };

    const total = validData.reduce((sum, d) => sum + d.value, 0);
    return {
      average: Math.round(total / validData.length),
      total: Math.round(total),
    };
  }, [data]);

  if (loading) {
    return (
      <LiquidGlassView
        effect="clear"
        style={[styles.container, { backgroundColor: colors.surface }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dataTypeConfig.color} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t("loadingChart")}
          </Text>
        </View>
      </LiquidGlassView>
    );
  }

  return (
    <LiquidGlassView
      effect="clear"
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("average")}
          </Text>
          <Text style={[styles.statValue, { color: dataTypeConfig.color }]}>
            {average} {dataTypeConfig.unit}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("total")}
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {total} {dataTypeConfig.unit}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          style={styles.chart}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <G key={index}>
              <Line
                x1={CHART_PADDING}
                y1={CHART_PADDING + (CHART_HEIGHT - CHART_PADDING * 2) * ratio}
                x2={CHART_WIDTH - CHART_PADDING}
                y2={CHART_PADDING + (CHART_HEIGHT - CHART_PADDING * 2) * ratio}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="5,5"
              />
              <SvgText
                x={CHART_PADDING - 8}
                y={CHART_PADDING + (CHART_HEIGHT - CHART_PADDING * 2) * ratio + 4}
                fill={colors.textTertiary}
                fontSize={scale(10)}
                textAnchor="end"
              >
                {Math.round(chartData.maxValue * (1 - ratio))}
              </SvgText>
            </G>
          ))}

          {/* Line path */}
          {chartData.path && (
            <Path
              d={chartData.path}
              stroke={dataTypeConfig.color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {chartData.points.map((point, index) => (
            <G key={index}>
              <Circle
                cx={point.x}
                cy={point.y}
                r={scale(6)}
                fill={dataTypeConfig.color}
                stroke={colors.surface}
                strokeWidth={2}
              />
              {/* X-axis labels */}
              <SvgText
                x={point.x}
                y={CHART_HEIGHT - scale(8)}
                fill={colors.textSecondary}
                fontSize={scale(10)}
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            </G>
          ))}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View
          style={[styles.legendDot, { backgroundColor: dataTypeConfig.color }]}
        />
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
          {dataTypeConfig.label} ({period === "weekly" ? t("last7Days") : t("last30Days")})
        </Text>
      </View>
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(16),
  },
  loadingContainer: {
    height: CHART_HEIGHT + scale(80),
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...fontStyles.body2,
    marginTop: scale(12),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    ...fontStyles.caption,
    marginBottom: scale(4),
  },
  statValue: {
    ...fontStyles.headline3,
    fontWeight: "700",
  },
  chartContainer: {
    alignItems: "center",
    overflow: "hidden",
  },
  chart: {
    marginVertical: scale(8),
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(8),
  },
  legendDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    marginRight: scale(8),
  },
  legendText: {
    ...fontStyles.body2,
  },
});

export default NutritionChart;
