import React from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fontStyles } from "../../theme/fontStyles";
import { scale } from "../../theme/utils";
import useMealsStore from "../../zustand/useMealsStore";
import { deleteMeal } from "../../services/mealAnalysis";
import { syncMealLiveActivity } from "../../services/mealLiveActivitySync";
import { LiquidGlassView } from "@callstack/liquid-glass";
import FastImage from "react-native-fast-image";
import { useTheme } from "../../theme/ThemeContext";
import MealScoreSection from "./components/MealScoreSection";
import MealMacrosSection from "./components/MealMacrosSection";
import MealInsightsSection from "./components/MealInsightsSection";

type AnalyzedMealScreenProps = {
  mealId: string;
};

const AnalyzedMealScreen = () => {
  const { mealId } = useRoute().params as AnalyzedMealScreenProps;
  const meal = useMealsStore((state) =>
    state.loggedMeals.find((meal) => meal.id === mealId),
  );
  console.log("meal", meal, "id", mealId);
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  if (!meal) {
    return null;
  }

  const handleDelete = async () => {
    Alert.alert(t("deleteConfirmation"), t("deleteItemConfirmationMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            useMealsStore.setState((state) => {
              const newMeals = state.loggedMeals.filter(
                (m) => m.id !== meal.id,
              );
              if (!meal.id) return state;

              deleteMeal(meal.id);
              return { loggedMeals: newMeals };
            });
            if (meal.date) syncMealLiveActivity(meal.date);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting meal:", error);
            Alert.alert(t("error"), t("deleteFailed"));
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate("LogMeal", {
      mealId: meal.id,
      selectedDate: meal.date,
    });
  };


return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect="clear"
        style={[styles.pageHeader, { paddingTop: top }]}
      >
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={scale(28)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("mealAnalysis")}
        </Text>
        <View style={styles.headerSpacer} />
      </LiquidGlassView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + scale(96), paddingTop: top + scale(70) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topSection, { backgroundColor: colors.surface }]}>
          {meal.image ? (
            <FastImage source={{ uri: meal.image }} style={styles.mealImage} />
          ) : (
            <View
              style={[
                styles.emojiContainer,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Text style={styles.emoji}>{meal.emoji || "🍽️"}</Text>
            </View>
          )}
          <View style={styles.basicInfo}>
            <Text
              style={[styles.mealName, { color: colors.text }]}
              numberOfLines={3}
            >
              {meal.description}
            </Text>
            <View
              style={[
                styles.calorieContainer,
                { backgroundColor: colors["color-danger-100"] },
              ]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={scale(20)}
                color={colors["color-danger-500"]}
              />
              <Text style={styles.calorieValue}>{meal.calories}</Text>
              <Text style={styles.calorieUnit}>{t("cal")}</Text>
            </View>
          </View>
        </View>
        <MealScoreSection score={meal.score} />
        <MealMacrosSection
          proteins={meal.proteins ?? 0}
          carbs={meal.carbs ?? 0}
          fats={meal.fats ?? 0}
          variant="content"
        />
        <MealInsightsSection insights={meal.insights} />

        <View style={styles.actionContainer}>
          <LiquidGlassView
            effect="clear"
            interactive
            style={[
              styles.actionButtonPrimary,
              { backgroundColor: colors.surface },
            ]}
          >
            <TouchableOpacity
              style={styles.actionButtonInner}
              onPress={handleEdit}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={scale(22)}
                color={colors.text}
              />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("edit")}
              </Text>
            </TouchableOpacity>
          </LiquidGlassView>

          <LiquidGlassView
            effect="clear"
            interactive
            style={[
              styles.actionButtonDanger,
              { backgroundColor: colors["color-danger-500"] },
            ]}
          >
            <TouchableOpacity
              style={styles.actionButtonInner}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={scale(22)}
                color={colors.white}
              />
              <Text style={[styles.actionText, { color: colors.white }]}>
                {t("delete")}
              </Text>
            </TouchableOpacity>
          </LiquidGlassView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  pageHeader: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    zIndex: 1,
    width: "100%",
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...fontStyles.headline1,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: scale(40),
  },
  // Top Section
  topSection: {
    flexDirection: "row",
    marginBottom: scale(24),
    alignItems: "flex-start",
    borderRadius: scale(20),
    padding: scale(16),
  },
  mealImage: {
    width: "40%",
    height: scale(120),
    borderRadius: scale(16),
    marginRight: scale(16),
  },
  emojiContainer: {
    width: "35%",
    height: scale(100),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  emoji: {
    fontSize: scale(40),
  },
  basicInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  mealName: {
    ...fontStyles.headline2,
    marginBottom: scale(12),
    lineHeight: scale(28),
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    alignSelf: "flex-start",
  },
  calorieValue: {
    ...fontStyles.headline3,
    color: "#DC2626",
    fontWeight: "700",
    marginLeft: scale(6),
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: "#DC2626",
    marginLeft: scale(2),
    fontWeight: "600",
  },
  // Action Buttons
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(10),
  },
  actionButtonPrimary: {
    flex: 1.5,
    borderRadius: scale(20),
  },
  actionButtonDanger: {
    flex: 1,
    borderRadius: scale(20),
  },
  actionButtonInner: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(8),
    gap: scale(6),
  },
  actionText: {
    ...fontStyles.body1Bold,
    textAlign: "center",
  },
});

export default AnalyzedMealScreen;
