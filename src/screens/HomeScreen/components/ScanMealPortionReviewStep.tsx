import { MaterialCommunityIcons } from "@expo/vector-icons";
import { t } from "i18next";
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import * as Haptics from "expo-haptics";
import AppButton from "../../../components/AppButton";
import GlassView from "../../../components/SafeGlassView";
import {
  DetectedMealPortions,
  MealPortionItem,
  MealPortionQuestion,
  MealPortionQuestionOption,
} from "../../../services/apiTypes";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

type ScanMealPortionReviewStepProps = {
  photoUri: string;
  loading: boolean;
  detectedPortions: DetectedMealPortions;
  onAnalyze: (confirmedPortions: DetectedMealPortions) => void;
  onRetake: () => void;
};

type PortionItemRowProps = {
  item: MealPortionItem;
  loading: boolean;
  onAmountChange: (id: string, nextAmount: number) => void;
};

type PortionQuestionCardProps = {
  question: MealPortionQuestion;
  loading: boolean;
  onAnswerChange: (id: string, value: string) => void;
};

type PortionQuestionOptionChipProps = {
  option: MealPortionQuestionOption;
  questionId: string;
  selected: boolean;
  loading: boolean;
  onAnswerChange: (id: string, value: string) => void;
};

const MIN_AMOUNT = 0;

const getAdjustedAmount = (amount: number, delta: number) => {
  const nextAmount = Math.max(MIN_AMOUNT, amount + delta);

  return Number.isInteger(delta) ? Math.round(nextAmount) : nextAmount;
};

const getUnitLabel = (item: MealPortionItem) => {
  if (item.unit === "piece") return "";

  return item.unit;
};

const getRelevantQuestions = (portions: DetectedMealPortions) => {
  const hiddenFatItemIds = new Set(
    portions.items.filter((item) => item.hiddenFatRisk).map((item) => item.id),
  );

  return portions.questions.filter(
    (question) =>
      question.category === "hidden_fat" &&
      question.appliesToItemIds.some((id) => hiddenFatItemIds.has(id)),
  );
};

const PortionItemRow = (props: PortionItemRowProps) => {
  const { colors, isDark } = useTheme();
  const canAdjust = props.item.adjustable && !props.loading;
  const isAndroidGlassFallback =
    Platform.OS === "android" && !isLiquidGlassSupported;
  const glassButtonShell = [
    styles.amountButton,
    isAndroidGlassFallback
      ? {
          backgroundColor: isDark ? `${colors.white}14` : `${colors.white}B8`,
          borderWidth: 1,
          borderColor: isDark ? `${colors.white}22` : `${colors.text}0F`,
          elevation: 3,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: scale(2) },
          shadowOpacity: 0.1,
          shadowRadius: scale(6),
        }
      : { backgroundColor: colors.background },
  ];

  const handleDecrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onAmountChange(
      props.item.id,
      getAdjustedAmount(props.item.amount, -props.item.stepSize),
    );
  };

  const handleIncrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onAmountChange(
      props.item.id,
      getAdjustedAmount(props.item.amount, props.item.stepSize),
    );
  };

  return (
    <View
      style={[
        styles.itemRow,
        {
          backgroundColor: colors.backgroundSecondary,
        },
      ]}
    >
      <View style={styles.itemTextContainer}>
        <View style={styles.itemNameRow}>
          <Text style={styles.itemEmoji}>{props.item.emoji || "🍽️"}</Text>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {props.item.name}
          </Text>
        </View>
      </View>

      <View style={styles.amountControls}>
        <GlassView
          effect="clear"
          interactive
          style={[...glassButtonShell, { opacity: canAdjust ? 1 : 0.45 }]}
        >
          <TouchableOpacity
            disabled={!canAdjust}
            onPress={handleDecrease}
            style={styles.glassButtonInner}
          >
            <MaterialCommunityIcons
              name="minus"
              size={scale(18)}
              color={colors.text}
            />
          </TouchableOpacity>
        </GlassView>
        <Text style={[styles.amountValue, { color: colors.text }]}>
          {props.item.amount}
          {getUnitLabel(props.item)}
        </Text>
        <GlassView
          effect="clear"
          interactive
          style={[...glassButtonShell, { opacity: canAdjust ? 1 : 0.45 }]}
        >
          <TouchableOpacity
            disabled={!canAdjust}
            onPress={handleIncrease}
            style={styles.glassButtonInner}
          >
            <MaterialCommunityIcons
              name="plus"
              size={scale(18)}
              color={colors.text}
            />
          </TouchableOpacity>
        </GlassView>
      </View>
    </View>
  );
};

const PortionQuestionOptionChip = (props: PortionQuestionOptionChipProps) => {
  const { colors } = useTheme();

  const handlePress = () => {
    props.onAnswerChange(props.questionId, props.option.value);
  };

  return (
    <Pressable
      disabled={props.loading}
      onPress={handlePress}
      style={[
        styles.questionChip,
        {
          backgroundColor: props.selected
            ? colors.accent
            : colors.backgroundSecondary,
          borderColor: props.selected ? colors.accent : colors.border,
          opacity: props.loading ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.questionChipText,
          { color: props.selected ? colors.textInverse : colors.text },
        ]}
      >
        {props.option.label}
      </Text>
    </Pressable>
  );
};

const PortionQuestionCard = (props: PortionQuestionCardProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.questionCard,
        { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <Text style={[styles.questionLabel, { color: colors.text }]}>
        {props.question.label}
      </Text>
      <View style={styles.questionChips}>
        {props.question.options.map((option) => (
          <PortionQuestionOptionChip
            key={option.value}
            option={option}
            questionId={props.question.id}
            selected={option.value === props.question.selectedValue}
            loading={props.loading}
            onAnswerChange={props.onAnswerChange}
          />
        ))}
      </View>
    </View>
  );
};

const ScanMealPortionReviewStep = (props: ScanMealPortionReviewStepProps) => {
  const { colors } = useTheme();
  const [items, setItems] = useState(
    props.detectedPortions.items.filter((item) => item.adjustable),
  );
  const [questions, setQuestions] = useState(
    getRelevantQuestions(props.detectedPortions),
  );

  const handleItemAmountChange = (id: string, nextAmount: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, amount: nextAmount } : item,
      ),
    );
  };

  const handleAnswerChange = (id: string, value: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === id ? { ...question, selectedValue: value } : question,
      ),
    );
  };

  const handleAnalyze = () => {
    const confirmedItems = props.detectedPortions.items.map((item) => {
      const adjustedItem = items.find(
        (currentItem) => currentItem.id === item.id,
      );

      return adjustedItem ?? item;
    });

    props.onAnalyze({
      ...props.detectedPortions,
      items: confirmedItems,
      questions,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerImageWrapper}>
        <Image source={{ uri: props.photoUri }} style={styles.headerImage} />
        <Pressable
          disabled={props.loading}
          onPress={props.onRetake}
          style={[
            styles.retakeButton,
            {
              backgroundColor: colors.surface,
              opacity: props.loading ? 0.5 : 1,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="camera-retake"
            size={scale(20)}
            color={colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.contentSection}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("confirmPortions")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("confirmPortionsDescription")}
        </Text>

        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <PortionItemRow
              key={item.id}
              item={item}
              loading={props.loading}
              onAmountChange={handleItemAmountChange}
            />
          ))}
        </View>

        {questions.length > 0 && (
          <View style={styles.questionsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("quickDetails")}
            </Text>
            {questions.map((question) => (
              <PortionQuestionCard
                key={question.id}
                question={question}
                loading={props.loading}
                onAnswerChange={handleAnswerChange}
              />
            ))}
          </View>
        )}

        <AppButton
          title={t("analyzeMeal")}
          onPress={handleAnalyze}
          disabled={props.loading}
          margin={{ marginTop: scale(20) }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: scale(32),
  },
  headerImageWrapper: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: scale(340),
    borderRadius: scale(24),
  },
  retakeButton: {
    position: "absolute",
    top: scale(16),
    right: scale(16),
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  contentSection: {
    paddingHorizontal: scale(24),
    paddingTop: scale(18),
  },
  title: {
    ...fontStyles.headline2,
  },
  subtitle: {
    ...fontStyles.body1,
    marginTop: scale(2),
  },
  itemsContainer: {
    gap: scale(10),
    marginTop: scale(16),
  },
  itemRow: {
    borderRadius: scale(28),
    padding: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  itemTextContainer: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  itemEmoji: {
    fontSize: scale(20),
    lineHeight: scale(28),
    width: scale(24),
    textAlign: "center",
  },
  itemName: {
    ...fontStyles.body1Bold,
    flex: 1,
    lineHeight: scale(28),
  },
  amountControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  amountButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  glassButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  amountValue: {
    ...fontStyles.body1Bold,
    minWidth: scale(52),
    textAlign: "center",
  },
  questionsContainer: {
    marginTop: scale(22),
    gap: scale(10),
  },
  sectionTitle: {
    ...fontStyles.headline4,
  },
  questionCard: {
    borderRadius: scale(22),
    padding: scale(14),
  },
  questionLabel: {
    ...fontStyles.body1Bold,
  },
  questionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginTop: scale(10),
  },
  questionChip: {
    borderWidth: 1,
    borderRadius: scale(20),
    paddingHorizontal: scale(14),
    paddingVertical: scale(9),
  },
  questionChipText: {
    ...fontStyles.body1Bold,
  },
});

export default ScanMealPortionReviewStep;
