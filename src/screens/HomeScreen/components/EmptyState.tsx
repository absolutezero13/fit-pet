import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import plate from "./plate.png";

type Props = {
  onPress: () => void;
};

const EmptyState: FC<Props> = ({ onPress }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyStateContainer}>
      <Image source={plate} style={styles.emptyStateImage} />
      <Text style={styles.emptyStateTitle}>{t("noMealsLogged")}</Text>
      <Text style={styles.emptyStateDescription}>
        {t("trackYourNutrition")}
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={onPress}>
        <Text style={styles.emptyStateButtonText}>{t("logYourFirstMeal")}</Text>
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={scale(18)}
          color="white"
          style={{ marginLeft: scale(8) }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(32),
    paddingTop: scale(180),
  },
  emptyStateImage: {
    width: scale(150),
    height: scale(150),
    marginBottom: scale(24),
  },
  emptyStateTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
    textAlign: "center",
  },
  emptyStateDescription: {
    ...fontStyles.body1,
    color: colors["color-primary-400"],
    textAlign: "center",
    marginBottom: scale(32),
  },
  emptyStateButton: {
    backgroundColor: colors["color-success-400"],
    paddingHorizontal: scale(20),
    paddingVertical: scale(14),
    borderRadius: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors["color-success-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 4,
  },
  emptyStateButtonText: {
    ...fontStyles.headline4,
    color: "white",
  },
});

export default EmptyState;
