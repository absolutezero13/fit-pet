import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { FC } from "react";
import { fontStyles } from "../../../theme/fontStyles";

interface Props {
  proteins: string;
  carbs: string;
  fats: string;
}

const MacroCards: FC<Props> = ({ proteins, carbs, fats }) => {
  return (
    <View style={styles.macroContainer}>
      <View style={styles.macroCard}>
        <MaterialCommunityIcons
          name="food-steak"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={styles.macroValue}>{proteins}g</Text>
        <Text style={styles.macroLabel}>Protein</Text>
      </View>

      <View style={styles.macroCard}>
        <MaterialCommunityIcons
          name="bread-slice"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={styles.macroValue}>{carbs}g</Text>
        <Text style={styles.macroLabel}>Carbs</Text>
      </View>

      <View style={styles.macroCard}>
        <MaterialCommunityIcons
          name="oil"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={styles.macroValue}>{fats}g</Text>
        <Text style={styles.macroLabel}>Fats</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  macroCard: {
    width: "30%",
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(12),
    padding: scale(12),
    alignItems: "center",
  },
  macroValue: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginVertical: scale(4),
  },
  macroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
});

export default MacroCards;
