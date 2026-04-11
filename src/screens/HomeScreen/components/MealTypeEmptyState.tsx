import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";
import { LiquidGlassView } from "@callstack/liquid-glass";

type Props = {
  onPress?: () => void;
};

const MealTypeEmptyState: React.FC<Props> = ({ onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={scale(28)}
          color={colors.textTertiary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {t("tapToAddMeal")}
        </Text>
      </View>
      <LiquidGlassView
        effect="regular"
        interactive
        style={[styles.addButton]}
        tintColor={colors.background}
      >
        <View style={[styles.addButton]}>
          <MaterialCommunityIcons
            name="plus"
            size={scale(20)}
            color={colors.text}
          />
        </View>
      </LiquidGlassView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(20),
    flexDirection: "row",
    alignItems: "center",
    padding: scale(14),
    borderWidth: 2,
    borderStyle: "dashed",
    marginHorizontal: scale(24),
  },
  iconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
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
    marginBottom: scale(2),
  },
  subtitle: {
    ...fontStyles.caption,
  },
  addButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MealTypeEmptyState;
