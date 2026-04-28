import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from "@callstack/liquid-glass";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeInUp,
  FadeOut,
  LinearTransition,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import useKeyboardVisible from "../ChatScreen/components/useKeyboardVisible";
import AppButton from "../../components/AppButton";
import LoadingDots from "../../components/LoadingDots";
import {
  CookCandidate,
  CookFollowUpAnswer,
  CookFollowUpQuestion,
  CookMaxCaloriesOption,
  CookRecipe,
  LatestCookSession,
  CookPromptAnswers,
} from "../../services/apiTypes";
import { createCookCandidates, createCookRecipe } from "../../services/gptApi";
import { analyticsService, AnalyticsEvent } from "../../services/analytics";
import { storageService } from "../../storage/AsyncStorageService";
import { saveCookRecipe } from "../../services/cookRecipes";
import { fontStyles } from "../../theme/fontStyles";
import { useTheme } from "../../theme/ThemeContext";
import { scale } from "../../theme/utils";
import useUserStore from "../../zustand/useUserStore";
import userService from "../../services/user";
import CookCandidateCard from "./components/CookCandidateCard";
import CookOptionChips, { CookChipOption } from "./components/CookOptionChips";
import CookPlanSummary from "./components/CookPlanSummary";
import {
  getCaloriesLabel,
  getGoalLabel,
  getServingsLabel,
  getTimeLabel,
} from "./cookUtils";

const AnimatedLiquidGlassView =
  Animated.createAnimatedComponent(LiquidGlassView);

type CookViewState =
  | "cook_intro"
  | "allergen"
  | "kitchen"
  | "intro"
  | "questions"
  | "follow_up"
  | "candidate_loading"
  | "candidate_selection"
  | "recipe_loading"
  | "error";

type HardcodedQuestionKey =
  | "time"
  | "goal"
  | "servings"
  | "maxCaloriesPerServing";

interface HardcodedQuestion {
  key: HardcodedQuestionKey;
  title: string;
  options: CookChipOption[];
}

type SuggestedCookRecipe = {
  candidate: CookCandidate;
  recipe: CookRecipe;
  activeVariation: string | null;
  isRefreshing: boolean;
};

const CookScreen = () => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useUserStore();
  const seedInputRef = useRef<TextInput>(null);
  const isKeyboardVisible = useKeyboardVisible();

  const [viewState, setViewState] = useState<CookViewState>(() => {
    if (user?.onboarding?.allergens === undefined) return "cook_intro";
    if (user?.onboarding?.kitchenEquipment === undefined) return "kitchen";
    return "intro";
  });
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    user?.onboarding?.allergens ?? [],
  );
  const [selectedKitchenEquipment, setSelectedKitchenEquipment] = useState<
    string[]
  >(user?.onboarding?.kitchenEquipment ?? []);
  const [seedInput, setSeedInput] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [answers, setAnswers] = useState<Partial<CookPromptAnswers>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswerValue, setSelectedAnswerValue] = useState<string | null>(
    null,
  );
  const [isTransitioningQuestion, setIsTransitioningQuestion] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    CookFollowUpQuestion[]
  >([]);
  const [followUpQuestionIndex, setFollowUpQuestionIndex] = useState(0);
  const [pendingFollowUpAnswers, setPendingFollowUpAnswers] = useState<
    CookFollowUpAnswer[]
  >([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<
    SuggestedCookRecipe[]
  >([]);
  useEffect(() => {
    if (viewState !== "intro") {
      return;
    }

    const timer = setTimeout(() => {
      seedInputRef.current?.focus();
    }, 350);

    return () => clearTimeout(timer);
  }, [viewState]);

  const ALLERGEN_OPTIONS = useMemo(
    () => [
      { label: t("cookAllergenGluten"), value: "gluten" },
      { label: t("cookAllergenDairy"), value: "dairy" },
      { label: t("cookAllergenEggs"), value: "eggs" },
      { label: t("cookAllergenNuts"), value: "tree nuts" },
      { label: t("cookAllergenPeanuts"), value: "peanuts" },
      { label: t("cookAllergenShellfish"), value: "shellfish" },
      { label: t("cookAllergenFish"), value: "fish" },
      { label: t("cookAllergenSoy"), value: "soy" },
      { label: t("cookAllergenSesame"), value: "sesame" },
    ],
    [t],
  );

  const toggleAllergen = (value: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    );
  };

  const submitAllergens = async (overrideAllergens?: string[]) => {
    const allergensToSave = overrideAllergens ?? selectedAllergens;
    if (overrideAllergens) {
      setSelectedAllergens(overrideAllergens);
    }
    const prev = useUserStore.getState();
    const updated = prev
      ? {
          ...prev,
          onboarding: { ...prev.onboarding, allergens: allergensToSave },
        }
      : prev;
    useUserStore.setState(updated);
    setViewState("kitchen");
    try {
      await userService.createOrUpdateUser({
        onboarding: { ...prev?.onboarding, allergens: allergensToSave },
      });
    } catch (error) {
      console.log("SAVE ALLERGENS ERROR", error);
    }
  };

  const submitNoAllergens = () => {
    submitAllergens([]);
  };

  const toggleKitchenEquipment = (value: string) => {
    setSelectedKitchenEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
    );
  };

  const submitKitchenEquipment = async () => {
    const prev = useUserStore.getState();
    const updated = prev
      ? {
          ...prev,
          onboarding: {
            ...prev.onboarding,
            kitchenEquipment: selectedKitchenEquipment,
          },
        }
      : prev;
    useUserStore.setState(updated);
    setViewState("intro");
    try {
      await userService.createOrUpdateUser({
        onboarding: {
          ...prev?.onboarding,
          kitchenEquipment: selectedKitchenEquipment,
        },
      });
    } catch (error) {
      console.log("SAVE KITCHEN EQUIPMENT ERROR", error);
    }
  };

  const hardcodedQuestions = useMemo<HardcodedQuestion[]>(
    () => [
      {
        key: "time",
        title: t("cookQuestionTime"),
        options: [
          { label: t("cookTime15"), value: "15" },
          { label: t("cookTime30"), value: "30" },
          { label: t("cookTime45"), value: "45+" },
        ],
      },
      {
        key: "goal",
        title: t("cookQuestionGoal"),
        options: [
          { label: t("cookGoalHighProtein"), value: "high_protein" },
          { label: t("cookGoalBalanced"), value: "balanced" },
          { label: t("cookGoalLowCarb"), value: "low_carb" },
          { label: t("cookGoalBudgetFriendly"), value: "budget_friendly" },
        ],
      },
      {
        key: "servings",
        title: t("cookQuestionServings"),
        options: [
          { label: t("cookServing1"), value: "1" },
          { label: t("cookServing2"), value: "2" },
          { label: t("cookServing4"), value: "4+" },
        ],
      },
      {
        key: "maxCaloriesPerServing",
        title: t("cookQuestionMaxCalories"),
        options: [
          { label: t("cookCalories200"), value: "200" },
          { label: t("cookCalories400"), value: "400" },
          { label: t("cookCalories600"), value: "600" },
          { label: t("cookCalories800"), value: "800" },
          { label: t("cookCalories1000"), value: "1000" },
          { label: t("cookCaloriesAny"), value: "any" },
        ],
      },
    ],
    [t],
  );

  const currentQuestion = hardcodedQuestions[questionIndex];
  const currentFollowUpQuestion = followUpQuestions[followUpQuestionIndex];
  const isImmersiveMode =
    viewState !== "intro" &&
    viewState !== "allergen" &&
    viewState !== "kitchen" &&
    viewState !== "cook_intro";
  const isLoadingState =
    viewState === "candidate_loading" || viewState === "recipe_loading";
  const recommendedCaloriesValue = useMemo(() => {
    const dailyCalories = user?.macroGoals?.calories;

    if (!dailyCalories) {
      return undefined;
    }

    const MAIN_MEAL_CALORIE_FRACTION = 0.35;
    const estimatedMainMealCalories =
      dailyCalories * MAIN_MEAL_CALORIE_FRACTION;
    const options: CookMaxCaloriesOption[] = ["400", "600", "800", "1000"];

    return options.reduce((closest, option) => {
      const currentDistance = Math.abs(
        Number(option) - estimatedMainMealCalories,
      );
      const closestDistance = Math.abs(
        Number(closest) - estimatedMainMealCalories,
      );

      return currentDistance < closestDistance ? option : closest;
    }, options[0]);
  }, [user?.macroGoals?.calories]);

  const planItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];

    if (answers.seed) {
      items.push({ label: t("cookPlanSeed"), value: answers.seed });
    }
    if (answers.time) {
      items.push({
        label: t("cookPlanTime"),
        value: getTimeLabel(t, answers.time),
      });
    }
    if (answers.goal) {
      items.push({
        label: t("cookPlanGoal"),
        value: getGoalLabel(t, answers.goal),
      });
    }
    if (answers.servings) {
      items.push({
        label: t("cookPlanServings"),
        value: getServingsLabel(t, answers.servings),
      });
    }
    if (answers.maxCaloriesPerServing) {
      items.push({
        label: t("cookPlanCalories"),
        value: getCaloriesLabel(t, answers.maxCaloriesPerServing),
      });
    }

    return items;
  }, [
    answers.goal,
    answers.maxCaloriesPerServing,
    answers.seed,
    answers.servings,
    answers.time,
    t,
  ]);

  const submitSeed = () => {
    const trimmedSeed = seedInput.trim();

    if (!trimmedSeed) {
      return;
    }

    setAnswers({ seed: trimmedSeed });
    setViewState("questions");
    setQuestionIndex(0);
    setSelectedAnswerValue(null);
    setIsTransitioningQuestion(false);
    setErrorMessage("");
    setFollowUpQuestions([]);
    setFollowUpQuestionIndex(0);
    setPendingFollowUpAnswers([]);
    setSuggestedRecipes([]);
  };

  const logCookRecipeGenerated = (candidateId: string, recipe: CookRecipe) => {
    analyticsService.logEvent(AnalyticsEvent.CookRecipeGenerated, {
      recipeId: recipe.id,
      candidateId,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      totalMinutes: recipe.prepMinutes + recipe.cookMinutes,
      ingredientCount: recipe.ingredients.length,
      stepCount: recipe.steps.length,
    });
  };

  const buildSuggestedRecipes = async (
    nextAnswers: CookPromptAnswers,
    nextCandidates: CookCandidate[],
  ) => {
    const nextSuggestedRecipes = await Promise.all(
      nextCandidates.map(async (candidate) => {
        const recipeResponse = await createCookRecipe(nextAnswers, candidate);
        logCookRecipeGenerated(candidate.id, recipeResponse.recipe);

        return {
          candidate,
          recipe: recipeResponse.recipe,
          activeVariation: null,
          isRefreshing: false,
        };
      }),
    );

    return nextSuggestedRecipes;
  };

  const requestCandidates = async (nextAnswers: CookPromptAnswers) => {
    try {
      setErrorMessage("");
      setViewState("candidate_loading");
      const response = await createCookCandidates(nextAnswers);

      if (response.phase === "clarify" && response.followUpQuestions?.length) {
        setFollowUpQuestions(response.followUpQuestions);
        setFollowUpQuestionIndex(0);
        setPendingFollowUpAnswers([]);
        setSuggestedRecipes([]);
        setSelectedAnswerValue(null);
        setIsTransitioningQuestion(false);
        setFollowUpInput("");
        setViewState("follow_up");
        return;
      }

      if (response.phase === "candidates" && response.candidates?.length) {
        const nextCandidates = response.candidates;

        analyticsService.logEvent(AnalyticsEvent.CookCandidatesGenerated, {
          goal: nextAnswers.goal,
          time: nextAnswers.time,
          servings: nextAnswers.servings,
          maxCaloriesPerServing: nextAnswers.maxCaloriesPerServing,
          followUpCount: nextAnswers.followUpAnswers?.length ?? 0,
          candidateCount: nextCandidates.length,
        });

        setViewState("recipe_loading");
        const nextSuggestedRecipes = await buildSuggestedRecipes(
          nextAnswers,
          nextCandidates,
        );

        setFollowUpQuestions([]);
        setFollowUpQuestionIndex(0);
        setPendingFollowUpAnswers([]);
        setSelectedAnswerValue(null);
        setIsTransitioningQuestion(false);
        setSuggestedRecipes(nextSuggestedRecipes);
        setViewState("candidate_selection");

        const firstCard = nextSuggestedRecipes[0];
        if (firstCard) {
          const latestSession: LatestCookSession = {
            recipe: firstCard.recipe,
            seed: (nextAnswers.seed as string) ?? "",
            savedAt: new Date().toISOString(),
          };
          await storageService.setItem("latestCook", latestSession);
        }
        return;
      }

      setErrorMessage(t("cookErrorBody"));
      setViewState("error");
    } catch (error) {
      console.log("COOK CANDIDATES ERROR", error);
      setErrorMessage(t("cookErrorBody"));
      setViewState("error");
    }
  };

  const handleHardcodedAnswer = async (value: string) => {
    if (isTransitioningQuestion) {
      return;
    }

    setIsTransitioningQuestion(true);
    setSelectedAnswerValue(value);
    await new Promise((resolve) => setTimeout(resolve, 140));

    const key = currentQuestion.key;
    const nextAnswers = {
      ...answers,
      [key]: value,
    } as Partial<CookPromptAnswers>;

    setAnswers(nextAnswers);

    if (questionIndex < hardcodedQuestions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setSelectedAnswerValue(null);
      setIsTransitioningQuestion(false);
      return;
    }

    setSelectedAnswerValue(null);
    setIsTransitioningQuestion(false);
    await requestCandidates(nextAnswers as CookPromptAnswers);
  };

  const submitFollowUp = async (selectedValue?: string) => {
    if (!currentFollowUpQuestion) {
      return;
    }

    const answerValue = (selectedValue ?? followUpInput).trim();

    if (!answerValue) {
      return;
    }

    if (selectedValue) {
      if (isTransitioningQuestion) {
        return;
      }

      setIsTransitioningQuestion(true);
      setSelectedAnswerValue(selectedValue);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }

    const nextPendingFollowUpAnswers = [
      ...pendingFollowUpAnswers,
      {
        questionId: currentFollowUpQuestion.id,
        question: currentFollowUpQuestion.title,
        answer: answerValue,
      },
    ];

    if (followUpQuestionIndex < followUpQuestions.length - 1) {
      setPendingFollowUpAnswers(nextPendingFollowUpAnswers);
      setFollowUpQuestionIndex(followUpQuestionIndex + 1);
      setSelectedAnswerValue(null);
      setIsTransitioningQuestion(false);
      setFollowUpInput("");
      return;
    }

    const nextAnswers = {
      ...answers,
      followUpAnswers: [
        ...(answers.followUpAnswers ?? []),
        ...nextPendingFollowUpAnswers,
      ],
    } as CookPromptAnswers;

    setPendingFollowUpAnswers([]);
    setSelectedAnswerValue(null);
    setIsTransitioningQuestion(false);
    setAnswers(nextAnswers);
    await requestCandidates(nextAnswers);
  };

  const startCookingSuggestedRecipe = async (candidateId: string) => {
    const selectedRecipe = suggestedRecipes.find(
      (item) => item.candidate.id === candidateId,
    );

    if (!selectedRecipe || selectedRecipe.isRefreshing) {
      return;
    }

    const savedAt = new Date().toISOString();
    const latestSession: LatestCookSession = {
      recipe: selectedRecipe.recipe,
      seed: (answers.seed as string) ?? "",
      savedAt,
    };
    await storageService.setItem("latestCook", latestSession);
    void saveCookRecipe(selectedRecipe.recipe);

    navigation.navigate("CookRecipe", {
      recipe: selectedRecipe.recipe,
    });
  };

  const handleVariationPress = async (
    candidateId: string,
    variation: string,
  ) => {
    const selectedRecipe = suggestedRecipes.find(
      (item) => item.candidate.id === candidateId,
    );

    if (!selectedRecipe || selectedRecipe.isRefreshing) {
      return;
    }

    setSuggestedRecipes((current) =>
      current.map((item) =>
        item.candidate.id === candidateId
          ? {
              ...item,
              activeVariation: variation,
              isRefreshing: true,
            }
          : item,
      ),
    );

    try {
      const response = await createCookRecipe(
        answers as CookPromptAnswers,
        selectedRecipe.candidate,
        { variation, currentRecipe: selectedRecipe.recipe },
      );

      logCookRecipeGenerated(selectedRecipe.candidate.id, response.recipe);

      setSuggestedRecipes((current) =>
        current.map((item) =>
          item.candidate.id === candidateId
            ? {
                ...item,
                recipe: response.recipe,
                activeVariation: null,
                isRefreshing: false,
              }
            : item,
        ),
      );
    } catch (error) {
      console.log("COOK RECIPE VARIATION ERROR", error);
      setSuggestedRecipes((current) =>
        current.map((item) =>
          item.candidate.id === candidateId
            ? {
                ...item,
                activeVariation: null,
                isRefreshing: false,
              }
            : item,
        ),
      );
      Alert.alert(t("cookErrorTitle"), t("cookErrorBody"));
    }
  };

  const resetCookFlow = () => {
    setViewState("intro");
    setSeedInput("");
    setFollowUpInput("");
    setErrorMessage("");
    setAnswers({});
    setQuestionIndex(0);
    setSelectedAnswerValue(null);
    setIsTransitioningQuestion(false);
    setFollowUpQuestions([]);
    setFollowUpQuestionIndex(0);
    setPendingFollowUpAnswers([]);
    setSuggestedRecipes([]);
  };

  const confirmResetCookFlow = () => {
    Alert.alert(t("cookDiscardTitle"), t("cookDiscardBody"), [
      {
        text: t("cookDiscardCancel"),
        style: "cancel",
      },
      {
        text: t("cookDiscardConfirm"),
        style: "destructive",
        onPress: resetCookFlow,
      },
    ]);
  };

  const renderCookIntro = () => (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[styles.sectionGap, { alignSelf: "stretch" }]}
    >
      <View style={[styles.heroBlock, { alignItems: "center" }]}>
        <Text
          style={[
            styles.heroTitle,
            { color: colors.text, textAlign: "center" },
          ]}
        >
          {t("cookOnboardingTitle")}
        </Text>
        <Text
          style={[
            styles.heroBody,
            { color: colors.textSecondary, textAlign: "center" },
          ]}
        >
          {t("cookOnboardingBody")}
        </Text>
      </View>
      <AppButton
        title={t("cookOnboardingCta")}
        onPress={() => setViewState("allergen")}
        backgroundColor={colors.accent}
      />
    </Animated.View>
  );

  const renderAllergen = () => (
    <Animated.View entering={FadeInUp.duration(220)} style={styles.sectionGap}>
      <View style={styles.heroBlock}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          {t("cookAllergenTitle")}
        </Text>
        <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
          {t("cookAllergenBody")}
        </Text>
      </View>
      <View
        style={[
          styles.messageCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={submitNoAllergens}
          style={[
            styles.allergenNoneChip,
            {
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={scale(18)}
            color={colors["color-success-500"]}
          />
          <Text style={[styles.allergenNoneLabel, { color: colors.text }]}>
            {t("cookAllergenNone")}
          </Text>
        </Pressable>
        <View style={styles.allergenGrid}>
          {ALLERGEN_OPTIONS.map((option) => {
            const isSelected = selectedAllergens.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleAllergen(option.value)}
                style={[
                  styles.allergenChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.backgroundSecondary,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.allergenLabel,
                    {
                      color: isSelected ? colors.textInverse : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AppButton
          title={t("cookAllergenContinue")}
          onPress={() => submitAllergens()}
          backgroundColor={colors.accent}
        />
      </View>
    </Animated.View>
  );

  const KITCHEN_OPTIONS = [
    { label: t("cookKitchenOven"), value: "oven" },
    { label: t("cookKitchenAirFryer"), value: "air_fryer" },
    { label: t("cookKitchenStovetop"), value: "stovetop" },
    { label: t("cookKitchenMicrowave"), value: "microwave" },
    { label: t("cookKitchenBlender"), value: "blender" },
    { label: t("cookKitchenGrill"), value: "grill" },
    { label: t("cookKitchenSlowCooker"), value: "slow_cooker" },
    { label: t("cookKitchenInstantPot"), value: "instant_pot" },
  ];

  const renderKitchen = () => (
    <Animated.View entering={FadeInUp.duration(220)} style={styles.sectionGap}>
      <View style={styles.heroBlock}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          {t("cookKitchenTitle")}
        </Text>
        <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
          {t("cookKitchenBody")}
        </Text>
      </View>
      <View
        style={[
          styles.messageCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.allergenGrid}>
          {KITCHEN_OPTIONS.map((option) => {
            const isSelected = selectedKitchenEquipment.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleKitchenEquipment(option.value)}
                style={[
                  styles.allergenChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.backgroundSecondary,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.allergenLabel,
                    { color: isSelected ? colors.textInverse : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AppButton
          title={t("cookKitchenContinue")}
          onPress={submitKitchenEquipment}
          backgroundColor={colors.accent}
        />
      </View>
    </Animated.View>
  );

  const renderIntro = () => (
    <Animated.View entering={FadeInUp.duration(220)} style={styles.sectionGap}>
      <View style={styles.heroBlock}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          {t("cookIntroTitle")}
        </Text>
      </View>

      <TextInput
        ref={seedInputRef}
        value={seedInput}
        onChangeText={setSeedInput}
        multiline
        numberOfLines={4}
        placeholder={t("cookInputPlaceholder")}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.seedInput,
          { borderColor: colors.border, color: colors.text },
        ]}
        textAlignVertical="top"
      />
      <AppButton
        title={t("cookStartPlanning")}
        onPress={submitSeed}
        backgroundColor={colors.accent}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("MyRecipes")}
        style={styles.myRecipesLink}
      >
        <Text
          style={[styles.myRecipesLinkText, { color: colors.textSecondary }]}
        >
          {t("myRecipes")}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuestion = () => (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={
        questionIndex === hardcodedQuestions.length - 1
          ? FadeOut.duration(180)
          : undefined
      }
      style={styles.sectionGap}
    >
      <CookPlanSummary items={planItems} />
      <View
        style={[
          styles.messageCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Animated.View
          key={`question-${currentQuestion.key}`}
          entering={SlideInRight.duration(260)}
          exiting={SlideOutLeft.duration(220)}
          layout={LinearTransition}
          style={styles.questionStage}
        >
          <View style={styles.questionMetaRow}>
            <View
              style={[
                styles.progressPill,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Text
                style={[styles.progressLabel, { color: colors.textSecondary }]}
              >
                {t("cookQuestionProgress", {
                  current: questionIndex + 1,
                  total: hardcodedQuestions.length,
                })}
              </Text>
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {currentQuestion.title}
          </Text>
          <CookOptionChips
            options={currentQuestion.options}
            selectedValue={selectedAnswerValue ?? undefined}
            recommendedValue={
              currentQuestion.key === "maxCaloriesPerServing"
                ? recommendedCaloriesValue
                : undefined
            }
            disabled={isTransitioningQuestion}
            onSelect={handleHardcodedAnswer}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderFollowUp = () => (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={
        followUpQuestionIndex === followUpQuestions.length - 1
          ? FadeOut.duration(180)
          : undefined
      }
      style={styles.sectionGap}
    >
      <View
        style={[
          styles.messageCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {currentFollowUpQuestion ? (
          <Animated.View
            key={`follow-up-${currentFollowUpQuestion.id}`}
            entering={SlideInRight.duration(260)}
            exiting={SlideOutLeft.duration(220)}
            layout={LinearTransition}
            style={styles.questionStage}
          >
            <View style={styles.questionMetaRow}>
              <View
                style={[
                  styles.progressPill,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Text
                  style={[
                    styles.progressLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("cookClarifyProgress", {
                    current: followUpQuestionIndex + 1,
                    total: followUpQuestions.length,
                  })}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {currentFollowUpQuestion.title}
            </Text>
            {currentFollowUpQuestion.type === "single_select" &&
            currentFollowUpQuestion.options?.length ? (
              <>
                <CookOptionChips
                  options={currentFollowUpQuestion.options.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  selectedValue={selectedAnswerValue ?? undefined}
                  disabled={isTransitioningQuestion}
                  onSelect={submitFollowUp}
                />
                <TextInput
                  value={followUpInput}
                  onChangeText={setFollowUpInput}
                  placeholder={t("cookFollowUpPlaceholder")}
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                    },
                  ]}
                  textAlignVertical="center"
                  onSubmitEditing={() => submitFollowUp()}
                />
                <AppButton
                  title={t("cookContinue")}
                  onPress={() => submitFollowUp()}
                  backgroundColor={colors.accent}
                />
              </>
            ) : (
              <>
                <TextInput
                  value={followUpInput}
                  onChangeText={setFollowUpInput}
                  placeholder={t("cookFollowUpPlaceholder")}
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                    },
                  ]}
                  textAlignVertical="center"
                  onSubmitEditing={() => submitFollowUp()}
                />
                <AppButton
                  title={t("cookContinue")}
                  onPress={() => submitFollowUp()}
                  backgroundColor={colors.accent}
                />
              </>
            )}
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderLoading = (label: string) => (
    <Animated.View
      entering={FadeInUp.duration(200)}
      style={styles.loadingState}
    >
      <LoadingDots />
      <Text style={[styles.loadingText, { color: colors.text }]}>{label}</Text>
    </Animated.View>
  );

  const renderCandidates = () => (
    <Animated.View entering={FadeInUp.duration(240)} style={styles.sectionGap}>
      <View style={styles.candidateGrid}>
        {suggestedRecipes.map(
          ({ candidate, recipe, activeVariation, isRefreshing }, index) => (
            <CookCandidateCard
              key={candidate.id}
              recipe={recipe}
              index={index}
              isRefreshing={isRefreshing}
              activeVariation={activeVariation}
              onStartCooking={() => startCookingSuggestedRecipe(candidate.id)}
              onPressVariation={(variation) =>
                handleVariationPress(candidate.id, variation)
              }
            />
          ),
        )}
      </View>
    </Animated.View>
  );

  const renderError = () => (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[
        styles.messageCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        {t("cookErrorTitle")}
      </Text>
      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        {errorMessage}
      </Text>
      <AppButton
        title={t("cookTryAgain")}
        onPress={() => {
          if (
            answers.seed &&
            answers.time &&
            answers.goal &&
            answers.servings &&
            answers.maxCaloriesPerServing
          ) {
            requestCandidates(answers as CookPromptAnswers);
          } else {
            resetCookFlow();
          }
        }}
        backgroundColor={colors.accent}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isImmersiveMode ? (
        <AnimatedLiquidGlassView
          effect="clear"
          layout={LinearTransition}
          style={[
            styles.header,
            {
              paddingTop: top,
              paddingBottom: isKeyboardVisible ? scale(8) : scale(22),
              backgroundColor: isLiquidGlassSupported
                ? undefined
                : colors.backgroundSecondary,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text
                style={[
                  isKeyboardVisible
                    ? { ...fontStyles.headline2, color: colors.text }
                    : { ...fontStyles.headline1, color: colors.text },
                ]}
              >
                {t("tabCook")}
              </Text>
            </View>
            {viewState !== "intro" &&
              viewState !== "cook_intro" &&
              viewState !== "allergen" &&
              viewState !== "kitchen" && (
                <Pressable onPress={resetCookFlow} style={styles.headerAction}>
                  <MaterialCommunityIcons
                    name="refresh"
                    size={scale(22)}
                    color={colors.text}
                  />
                </Pressable>
              )}
          </View>
        </AnimatedLiquidGlassView>
      ) : null}

      {isImmersiveMode ? (
        <View style={[styles.immersiveTopBar, { paddingTop: top + scale(8) }]}>
          <Text style={[styles.immersiveTitle, { color: colors.text }]}>
            {t("cookImmersiveTitle")}
          </Text>
          <LiquidGlassView
            effect="clear"
            interactive
            style={styles.immersiveExitGlass}
          >
            <Pressable
              onPress={confirmResetCookFlow}
              style={[
                styles.immersiveExitButton,
                {
                  backgroundColor: isLiquidGlassSupported
                    ? undefined
                    : colors.accent,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={scale(20)}
                color={
                  isLiquidGlassSupported ? colors.text : colors.textInverse
                }
              />
            </Pressable>
          </LiquidGlassView>
        </View>
      ) : null}

      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: isImmersiveMode ? top + scale(64) : top + scale(100),
            paddingBottom: isImmersiveMode ? scale(120) : scale(144),
            justifyContent:
              isLoadingState || viewState === "cook_intro"
                ? "center"
                : "flex-start",
            flexGrow: 1,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isLoadingState}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {viewState === "cook_intro" && renderCookIntro()}
        {viewState === "allergen" && renderAllergen()}
        {viewState === "kitchen" && renderKitchen()}
        {viewState === "intro" && renderIntro()}
        {viewState === "questions" && renderQuestion()}
        {viewState === "follow_up" && renderFollowUp()}
        {viewState === "candidate_loading" &&
          renderLoading(t("cookGeneratingCandidates"))}
        {viewState === "candidate_selection" && renderCandidates()}
        {viewState === "recipe_loading" &&
          renderLoading(t("cookBuildingRecipe"))}
        {viewState === "error" && renderError()}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  headerCopy: {
    flex: 1,
  },
  headerAction: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    alignItems: "center",
    justifyContent: "center",
  },
  immersiveTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: scale(24),
    paddingBottom: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  immersiveTitle: {
    ...fontStyles.headline3,
  },
  immersiveTitleWrap: {
    borderRadius: scale(99),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
  },
  immersiveExitGlass: {
    borderRadius: scale(24),
  },
  immersiveExitButton: {
    alignItems: "center",
    justifyContent: "center",
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
  },
  content: {
    padding: scale(24),
    paddingBottom: scale(120),
    gap: scale(18),
  },
  sectionGap: {
    gap: scale(18),
  },
  heroBlock: {
    gap: scale(4),
  },
  heroTitle: {
    ...fontStyles.headline1,
  },
  heroBody: {
    ...fontStyles.body1,
  },
  myRecipesLink: {
    alignItems: "center",
    paddingVertical: scale(8),
  },
  myRecipesLinkText: {
    ...fontStyles.body2,
    textDecorationLine: "underline",
  },
  candidateGrid: {
    gap: scale(14),
  },
  cookIntroIconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  allergenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
  },
  allergenChip: {
    borderWidth: 1,
    borderRadius: scale(20),
    paddingHorizontal: scale(14),
    paddingVertical: scale(9),
  },
  allergenLabel: {
    ...fontStyles.body1Bold,
  },
  allergenNoneChip: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: scale(18),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  allergenNoneLabel: {
    ...fontStyles.body1Bold,
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: scale(24),
    padding: scale(18),
    gap: scale(14),
    overflow: "hidden",
  },
  questionStage: {
    gap: scale(14),
  },
  questionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(10),
  },
  loadingState: {
    minHeight: scale(180),
    alignItems: "center",
    justifyContent: "center",
    gap: scale(16),
  },
  loadingText: {
    ...fontStyles.headline3,
    textAlign: "center",
  },
  cardLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  cardTitle: {
    ...fontStyles.headline2,
  },
  progressPill: {
    borderRadius: scale(99),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  progressLabel: {
    ...fontStyles.caption,
  },
  seedInput: {
    borderWidth: 1,
    borderRadius: scale(22),
    minHeight: scale(120),
    paddingHorizontal: scale(18),
    paddingVertical: scale(16),
    ...fontStyles.headline3,
  },
  textInput: {
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    ...fontStyles.body1,
    lineHeight: 0,
  },
});

export default CookScreen;
