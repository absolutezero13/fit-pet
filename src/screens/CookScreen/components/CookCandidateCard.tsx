import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import Animated, { FadeInUp } from "react-native-reanimated";
import { CookCandidate } from "../../../services/apiTypes";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

interface CookCandidateCardProps {
  candidate: CookCandidate;
  index?: number;
  onPress: () => void;
}

const CookCandidateCard = ({ candidate, index = 0, onPress }: CookCandidateCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const totalMinutes = candidate.prepMinutes + candidate.cookMinutes;
  const accentColor =
    index % 2 === 0 ? colors["color-success-400"] : colors["color-info-400"];
  const accentColorSoft = `${accentColor}18`;
  const accentColorMuted = `${accentColor}10`;
  const accentIcon = index % 2 === 0 ? "chef-hat" : "silverware-fork-knife";

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(320)} style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <LinearGradient
          colors={[accentColorSoft, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBlock}
        >
          <View style={[styles.iconWrap, { backgroundColor: accentColorSoft }]}> 
            <MaterialCommunityIcons
              name={accentIcon}
              size={scale(18)}
              color={accentColor}
            />
          </View>

          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: colors.text }]}>{candidate.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}> 
              {candidate.subtitle}
            </Text>
            <Text style={[styles.summary, { color: colors.textSecondary }]}> 
              {candidate.summary}
            </Text>
            <View style={[styles.cookButton, { backgroundColor: accentColor }]}> 
              <Text style={[styles.cookButtonLabel, { color: colors.textInverse }]}> 
                {t("cookStartCooking")}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={scale(15)}
                color={colors.textInverse}
              />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.metaRow}>
          <View style={[styles.metaCard, { backgroundColor: colors.backgroundSecondary }]}> 
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("cookMetaTime")}
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{totalMinutes} min</Text>
          </View>
          <View style={[styles.metaCard, { backgroundColor: colors.backgroundSecondary }]}> 
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("cookMetaServings")}
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{candidate.servings}</Text>
          </View>
          <View style={[styles.metaCard, { backgroundColor: colors.backgroundSecondary }]}> 
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("cookMetaLevel")}
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {getDifficultyLabel(t, candidate.difficulty)}
            </Text>
          </View>
        </View>

        <View style={[styles.fitBlock, { backgroundColor: accentColorMuted }]}> 
          <Text style={[styles.fitLabel, { color: accentColor }]}>{t("cookFitLabel")}</Text>
          <Text style={[styles.fitReason, { color: colors.text }]}>{candidate.fitReason}</Text>
        </View>

      </Pressable>
    </Animated.View>
  );
};

const getDifficultyLabel = (t: (key: string) => string, difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return t("cookDifficultyEasy");
    case "hard":
      return t("cookDifficultyHard");
    default:
      return t("cookDifficultyMedium");
  }
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  card: {
    borderWidth: 1,
    borderRadius: scale(28),
    padding: scale(18),
    gap: scale(14),
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.08,
    shadowRadius: scale(16),
    elevation: 4,
    overflow: "hidden",
  },
  heroBlock: {
    borderRadius: scale(22),
    padding: scale(16),
    gap: scale(14),
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  titleWrap: {
    gap: scale(6),
  },
  title: {
    ...fontStyles.headline2,
  },
  subtitle: {
    ...fontStyles.headline4,
  },
  summary: {
    ...fontStyles.body1,
  },
  metaRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  metaCard: {
    flex: 1,
    borderRadius: scale(18),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    gap: scale(2),
  },
  metaLabel: {
    ...fontStyles.caption,
  },
  metaValue: {
    ...fontStyles.body1Bold,
  },
  fitBlock: {
    borderRadius: scale(18),
    padding: scale(14),
    gap: scale(4),
  },
  fitLabel: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  fitReason: {
    ...fontStyles.body1Bold,
  },
  cookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    alignSelf: "flex-start",
    minHeight: scale(36),
    marginTop: scale(8),
  },
  cookButtonLabel: {
    ...fontStyles.body1Bold,
  },
});

export default CookCandidateCard;
