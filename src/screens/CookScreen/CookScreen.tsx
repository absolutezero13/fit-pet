import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from "@callstack/liquid-glass";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  FadeInUp,
  FadeOut,
  LinearTransition,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import AppButton from "../../components/AppButton";
import {
  CookCandidate,
  CookFollowUpAnswer,
  CookFollowUpQuestion,
  CookGoal,
  LatestCookSession,
  CookPromptAnswers,
  CookServingOption,
  CookTimeOption,
} from "../../services/apiTypes";
import { createCookCandidates, createCookRecipe } from "../../services/gptApi";
import { storageService } from "../../storage/AsyncStorageService";
import { fontStyles } from "../../theme/fontStyles";
import { useTheme } from "../../theme/ThemeContext";
import { scale } from "../../theme/utils";
import CookCandidateCard from "./components/CookCandidateCard";
import CookOptionChips, { CookChipOption } from "./components/CookOptionChips";
import CookPlanSummary from "./components/CookPlanSummary";

type CookViewState =
  | "intro"
  | "questions"
  | "follow_up"
  | "candidate_loading"
  | "candidate_selection"
  | "recipe_loading"
  | "error";

type HardcodedQuestionKey = "time" | "goal" | "servings";

interface HardcodedQuestion {
  key: HardcodedQuestionKey;
  title: string;
  options: CookChipOption[];
}

const LoadingDots = () => {
  const { colors } = useTheme();
  const first = useSharedValue(0);
  const second = useSharedValue(0);
  const third = useSharedValue(0);

  useEffect(() => {
    const animate = (value: typeof first, delay: number) => {
      value.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, {
            duration: 420,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        ),
      );
    };

    animate(first, 0);
    animate(second, 120);
    animate(third, 240);
  }, [first, second, third]);

  const firstDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + first.value * 0.65,
    transform: [
      { translateY: -4 * first.value },
      { scale: 0.96 + first.value * 0.08 },
    ],
  }));
  const secondDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + second.value * 0.65,
    transform: [
      { translateY: -4 * second.value },
      { scale: 0.96 + second.value * 0.08 },
    ],
  }));
  const thirdDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + third.value * 0.65,
    transform: [
      { translateY: -4 * third.value },
      { scale: 0.96 + third.value * 0.08 },
    ],
  }));

  return (
    <View style={styles.loadingDotsRow}>
      <Animated.View
        style={[
          styles.loadingDot,
          { backgroundColor: colors["color-success-400"] },
          firstDotStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.loadingDot,
          { backgroundColor: colors["color-success-400"] },
          secondDotStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.loadingDot,
          { backgroundColor: colors["color-success-400"] },
          thirdDotStyle,
        ]}
      />
    </View>
  );
};

const CookScreen = () => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const seedInputRef = useRef<TextInput>(null);

  const [viewState, setViewState] = useState<CookViewState>("intro");
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
  const [candidates, setCandidates] = useState<CookCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CookCandidate | null>(null);
  const [latestCook, setLatestCook] = useState<LatestCookSession | null>(null);

  useEffect(() => {
    if (viewState !== "intro") {
      return;
    }

    const timer = setTimeout(() => {
      seedInputRef.current?.focus();
    }, 250);

    return () => clearTimeout(timer);
  }, [viewState]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const loadLatestCook = async () => {
      const savedCook = await storageService.getItem("latestCook");
      setLatestCook(savedCook);
    };

    loadLatestCook();
  }, [isFocused]);

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
    ],
    [t],
  );

  const currentQuestion = hardcodedQuestions[questionIndex];
  const currentFollowUpQuestion = followUpQuestions[followUpQuestionIndex];
  const isImmersiveMode = viewState !== "intro";
  const isLoadingState =
    viewState === "candidate_loading" || viewState === "recipe_loading";

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

    return items;
  }, [answers.goal, answers.seed, answers.servings, answers.time, t]);

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
        setSelectedAnswerValue(null);
        setIsTransitioningQuestion(false);
        setFollowUpInput("");
        setViewState("follow_up");
        return;
      }

      if (response.phase === "candidates" && response.candidates?.length) {
        setFollowUpQuestions([]);
        setFollowUpQuestionIndex(0);
        setPendingFollowUpAnswers([]);
        setSelectedAnswerValue(null);
        setIsTransitioningQuestion(false);
        setCandidates(response.candidates.slice(0, 2));
        setViewState("candidate_selection");
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

  const chooseCandidate = async (candidate: CookCandidate) => {
    try {
      setSelectedCandidate(candidate);
      setViewState("recipe_loading");
      const response = await createCookRecipe(
        answers as CookPromptAnswers,
        candidate,
      );

      const latestSession: LatestCookSession = {
        recipe: response.recipe,
        seed: (answers.seed as string) ?? "",
        savedAt: new Date().toISOString(),
      };

      await storageService.setItem("latestCook", latestSession);
      setLatestCook(latestSession);
      setViewState("candidate_selection");
      navigation.navigate("CookRecipe", { recipe: response.recipe });
    } catch (error) {
      console.log("COOK RECIPE ERROR", error);
      setErrorMessage(t("cookErrorBody"));
      setViewState("error");
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
    setCandidates([]);
    setSelectedCandidate(null);
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

  const renderIntro = () => (
    <Animated.View entering={FadeInUp.duration(220)} style={styles.sectionGap}>
      <View style={styles.heroBlock}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          {t("cookIntroTitle")}
        </Text>
      </View>

      <View
        style={[
          styles.messageCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
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
          backgroundColor={colors["color-success-400"]}
        />
      </View>

      {latestCook ? (
        <Animated.View entering={FadeInUp.duration(260)}>
          <Pressable
            onPress={() =>
              navigation.navigate("CookRecipe", { recipe: latestCook.recipe })
            }
            style={[
              styles.latestCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.latestRow}>
              <View
                style={[
                  styles.latestIcon,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={scale(18)}
                  color={colors["color-success-500"]}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.cardTitle, { color: colors.text, flex: 1 }]}
              >
                {latestCook.recipe.title}
              </Text>
            </View>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              {t("cookLatestLabel")}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
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
            <Text
              style={[styles.cardLabel, { color: colors["color-success-500"] }]}
            >
              {t("cookAssistantLabel")}
            </Text>
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
              <Text
                style={[
                  styles.cardLabel,
                  { color: colors["color-success-500"] },
                ]}
              >
                {t("cookAssistantLabel")}
              </Text>
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
                  backgroundColor={colors["color-success-400"]}
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
                  backgroundColor={colors["color-success-400"]}
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
        {candidates.map((candidate, index) => (
          <CookCandidateCard
            key={candidate.id}
            candidate={candidate}
            index={index}
            onPress={() => chooseCandidate(candidate)}
          />
        ))}
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
        onPress={resetCookFlow}
        backgroundColor={colors["color-success-400"]}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isImmersiveMode ? (
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
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t("tabCook")}
              </Text>
            </View>
            {(viewState !== "intro" || selectedCandidate) && (
              <Pressable onPress={resetCookFlow} style={styles.headerAction}>
                <MaterialCommunityIcons
                  name="refresh"
                  size={scale(22)}
                  color={colors.text}
                />
              </Pressable>
            )}
          </View>
        </LiquidGlassView>
      ) : null}

      {isImmersiveMode ? (
        <View style={[styles.immersiveTopBar, { paddingTop: top + scale(8) }]}>
          <LinearGradient
            colors={[`${colors["color-success-400"]}24`, `${colors.surface}00`]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.immersiveTitleWrap}
          >
            <Text style={[styles.immersiveTitle, { color: colors.text }]}>
              {t("cookImmersiveTitle")}
            </Text>
          </LinearGradient>
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
                    : colors["color-success-400"],
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

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: isImmersiveMode ? top + scale(72) : top + scale(112),
            paddingBottom: isImmersiveMode ? scale(120) : scale(144),
            justifyContent: isLoadingState ? "center" : "flex-start",
            flexGrow: 1,
          },
        ]}
        scrollEnabled={!isLoadingState}
        showsVerticalScrollIndicator={false}
      >
        {viewState === "intro" && renderIntro()}
        {viewState === "questions" && renderQuestion()}
        {viewState === "follow_up" && renderFollowUp()}
        {viewState === "candidate_loading" &&
          renderLoading(t("cookGeneratingCandidates"))}
        {viewState === "candidate_selection" && renderCandidates()}
        {viewState === "recipe_loading" &&
          renderLoading(t("cookBuildingRecipe"))}
        {viewState === "error" && renderError()}
      </ScrollView>
    </View>
  );
};

const getTimeLabel = (t: (key: string) => string, value: string) => {
  switch (value as CookTimeOption) {
    case "15":
      return t("cookTime15");
    case "30":
      return t("cookTime30");
    default:
      return t("cookTime45");
  }
};

const getGoalLabel = (t: (key: string) => string, value: string) => {
  switch (value as CookGoal) {
    case "high_protein":
      return t("cookGoalHighProtein");
    case "low_carb":
      return t("cookGoalLowCarb");
    case "budget_friendly":
      return t("cookGoalBudgetFriendly");
    default:
      return t("cookGoalBalanced");
  }
};

const getServingsLabel = (t: (key: string) => string, value: string) => {
  switch (value as CookServingOption) {
    case "1":
      return t("cookServing1");
    case "2":
      return t("cookServing2");
    default:
      return t("cookServing4");
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(22),
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
  headerTitle: {
    ...fontStyles.headline1,
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
    borderRadius: scale(999),
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
  latestCard: {
    borderWidth: 1,
    borderRadius: scale(24),
    padding: scale(16),
    gap: scale(6),
  },
  latestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  latestIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: "center",
    justifyContent: "center",
  },
  candidateGrid: {
    gap: scale(14),
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: scale(24),
    padding: scale(18),
    gap: scale(14),
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
  loadingDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  loadingDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },
  cardLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  cardTitle: {
    ...fontStyles.headline2,
  },
  progressPill: {
    borderRadius: scale(999),
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
    borderRadius: scale(18),
    minHeight: scale(58),
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    ...fontStyles.body1,
  },
});

export default CookScreen;
