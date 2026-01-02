import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { useTranslation } from "react-i18next";

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
          color="#CCCCCC"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t("noMealsLogged")}</Text>
        <Text style={styles.subtitle}>{t("tapToAddMeal")}</Text>
      </View>
      <View style={styles.addButton}>
        <MaterialCommunityIcons name="plus" size={scale(20)} color="#4CAF50" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(20),
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderStyle: "dashed",
    marginHorizontal: scale(24),
  },
  iconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    backgroundColor: "#F0F0F0",
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
    color: "#888888",
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
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MealTypeEmptyState;
