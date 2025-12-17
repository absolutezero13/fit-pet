import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";

type Props = {
  title?: string;
  ctaText?: string;
  onPress?: () => void;
};

const MealTypeEmptyState: React.FC<Props> = ({
  title = "Henüz bir şey eklemedin.",
  ctaText = "Öğün Ekle",
  onPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.cta}>+ {ctaText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  card: {
    width: "100%",
    minHeight: scale(80),
    borderRadius: scale(28),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors["color-primary-200"],
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(24),
    paddingHorizontal: scale(16),
  },
  title: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
    textAlign: "center",
    marginBottom: scale(8),
  },
  cta: {
    ...fontStyles.headline3,
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
