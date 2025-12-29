import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { t } from "i18next";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { useTheme } from "../../../theme/ThemeContext";

const MealTypes = ({
  selectedMealType,
  setSelectedMealType,
}: {
  selectedMealType: string;
  setSelectedMealType: (type: string) => void;
}) => {
  const mealTypes = [t("breakfast"), t("lunch"), t("dinner"), t("snack")];
  const { colors } = useTheme();

  const Wrapper = isLiquidGlassSupported ? LiquidGlassView : View;
  return (
    <View style={styles.mealTypeOptions}>
      {mealTypes.map((type) => (
        <Wrapper
          key={type}
          effect="regular"
          interactive
          style={{
            borderRadius: scale(20),
            marginHorizontal: scale(4),
            marginBottom: scale(8),
          }}
        >
          <TouchableOpacity
            key={type}
            style={[
              styles.mealTypeButton,
              {
                backgroundColor: selectedMealType === type 
                  ? colors["color-primary-600"] 
                  : colors.border,
              },
            ]}
            onPress={() => setSelectedMealType(type)}
          >
            <Text style={[styles.mealTypeText, { color: colors.textInverse }]}>{type}</Text>
          </TouchableOpacity>
        </Wrapper>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mealTypeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: scale(-4),
  },
  mealTypeButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },
  mealTypeText: {
    ...fontStyles.body2,
  },
});

export default MealTypes;
