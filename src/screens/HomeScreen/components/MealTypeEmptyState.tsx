import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";

type Props = {
  title?: string;
  ctaText?: string;
  onPress?: () => void;
};

const MealTypeEmptyState: React.FC<Props> = ({ onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={onPress}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{t("noMealsLogged")}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(24),
    paddingHorizontal: scale(16),
  },
  title: {
    ...fontStyles.body1,
    textAlign: "center",
    marginBottom: scale(8),
  },
  cta: {
    ...fontStyles.headline4,
  },
  fab: {
    position: "absolute",
    bottom: scale(-26),
    alignSelf: "center",
    width: scale(68),
    height: scale(68),
    borderRadius: scale(34),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: scale(6) },
    shadowOpacity: 0.3,
    shadowRadius: scale(10),
    elevation: 6,
  },
});

export default MealTypeEmptyState;
