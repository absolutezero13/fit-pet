import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { useTranslation } from "react-i18next";

interface CustomCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
}

const DAYS_IN_WEEK = 7;

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(2026, 0, 1),
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const weekDays = useMemo(() => {
    const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
    const days: string[] = [];
    // Use a reference date to get weekday names (January 4, 1970 is a Sunday)
    const referenceDate = new Date(1970, 0, 4);
    for (let i = 0; i < 7; i++) {
      const date = new Date(referenceDate);
      date.setDate(referenceDate.getDate() + i);
      days.push(
        date.toLocaleDateString(locale, { weekday: "short" }).substring(0, 2)
      );
    }
    // Reorder to start from Monday (move Sunday to the end)
    return [...days.slice(1), days[0]];
  }, [i18n.language]);

  const monthYear = useMemo(() => {
    const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
    return currentMonth.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth, i18n.language]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6; // Sunday becomes 6
    
    const daysInMonth = lastDayOfMonth.getDate();
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Add empty slots to complete the last week
    while (days.length % DAYS_IN_WEEK !== 0) {
      days.push(null);
    }
    
    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    
    // Check if new month is before minDate month
    const minMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    if (newMonth >= minMonthStart) {
      setCurrentMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    
    // Don't allow going past the current month
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (newMonth <= todayMonthStart) {
      setCurrentMonth(newMonth);
    }
  };

  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    
    // Before min date
    if (dateOnly < minDateOnly) return true;
    
    // After today
    if (dateOnly > today) return true;
    
    return false;
  };

  const isSelected = (date: Date | null): boolean => {
    if (!date) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const canGoPrevious = useMemo(() => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const minMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return prevMonth >= minMonthStart;
  }, [currentMonth, minDate]);

  const canGoNext = useMemo(() => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return nextMonth <= todayMonthStart;
  }, [currentMonth, today]);

  const handleDatePress = (date: Date | null) => {
    if (date && !isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  return (
    <LiquidGlassView
      effect="clear"
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          disabled={!canGoPrevious}
          style={[
            styles.navButton,
            !canGoPrevious && styles.navButtonDisabled,
          ]}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={scale(28)}
            color={canGoPrevious ? colors.text : colors.textTertiary}
          />
        </TouchableOpacity>

        <Text style={[styles.monthText, { color: colors.text }]}>
          {monthYear}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          disabled={!canGoNext}
          style={[
            styles.navButton,
            !canGoNext && styles.navButtonDisabled,
          ]}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={scale(28)}
            color={canGoNext ? colors.text : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Week Days Header */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={[styles.weekDayText, { color: colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          const disabled = isDateDisabled(date);
          const selected = isSelected(date);
          const todayDate = isToday(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                selected && {
                  backgroundColor: colors["color-success-400"],
                },
                todayDate && !selected && {
                  borderWidth: 2,
                  borderColor: colors["color-success-400"],
                },
              ]}
              onPress={() => handleDatePress(date)}
              disabled={disabled || !date}
            >
              {date && (
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text },
                    disabled && { color: colors.textTertiary },
                    selected && { color: colors.textInverse },
                  ]}
                >
                  {date.getDate()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
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
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  navButton: {
    padding: scale(4),
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  monthText: {
    ...fontStyles.headline3,
    textTransform: "capitalize",
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: scale(8),
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: scale(8),
  },
  weekDayText: {
    ...fontStyles.body2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / DAYS_IN_WEEK}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(12),
  },
  dayText: {
    ...fontStyles.body1,
    fontWeight: "600",
  },
});

export default CustomCalendar;
