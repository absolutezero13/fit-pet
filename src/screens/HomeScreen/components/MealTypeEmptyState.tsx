import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { useTranslation } from "react-i18next";
import { colors } from "../../../theme/colors";

type Props = {
  onPress?: () => void;
};

const MealTypeEmptyState: React.FC<Props> = ({ onPress }) => {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={scale(28)}
          color={colors["color-primary-200"]}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t("noMealsLogged")}</Text>
        <Text style={styles.subtitle}>{t("tapToAddMeal")}</Text>
      </View>
      <View style={styles.addButton}>
        <MaterialCommunityIcons
          name="plus"
          size={scale(20)}
          color={colors["color-success-500"]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(20),
    backgroundColor: colors["color-primary-50"],
    flexDirection: "row",
    alignItems: "center",
    padding: scale(14),
    borderWidth: 2,
    borderColor: colors["color-primary-100"],
    borderStyle: "dashed",
    marginHorizontal: scale(24),
  },
  iconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    backgroundColor: colors["color-primary-100"],
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...fontStyles.body1,
    fontWeight: "500",
    color: colors["color-primary-400"],
    marginBottom: scale(2),
  },
  subtitle: {
    ...fontStyles.caption,
    color: "#AAAAAA",
  },
  addButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(12),
    backgroundColor: colors["color-success-50"],
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MealTypeEmptyState;
