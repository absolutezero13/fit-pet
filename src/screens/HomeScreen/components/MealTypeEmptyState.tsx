import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { useTranslation } from "react-i18next";

type Props = {
  title?: string;
  ctaText?: string;
  onPress?: () => void;
};

const MealTypeEmptyState: React.FC<Props> = ({ onPress }) => {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{t("noMealsLogged")}</Text>
      <Text style={styles.cta}>+ {t("logYourFirstMeal")}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: scale(28),
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors["color-primary-200"],
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(24),
    paddingHorizontal: scale(16),
  },
  title: {
    ...fontStyles.body1,
    color: colors["color-primary-400"],
    textAlign: "center",
    marginBottom: scale(8),
  },
  cta: {
    ...fontStyles.headline4,
    color: colors["color-success-400"],
  },
  fab: {
    position: "absolute",
    bottom: scale(-26),
    alignSelf: "center",
    width: scale(68),
    height: scale(68),
    borderRadius: scale(34),
    backgroundColor: colors["color-success-400"],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors["color-success-500"],
    shadowOffset: { width: 0, height: scale(6) },
    shadowOpacity: 0.3,
    shadowRadius: scale(10),
    elevation: 6,
  },
});

export default MealTypeEmptyState;
