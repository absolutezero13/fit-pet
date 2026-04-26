import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@callstack/liquid-glass";
import FastImage from "react-native-fast-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../theme/ThemeContext";
import { scale } from "../../theme/utils";
import { fontStyles } from "../../theme/fontStyles";
import { storageService } from "../../storage/AsyncStorageService";
import { PersistedCookRecipe } from "../../storage/types";

const MyRecipesScreen: FC = () => {
  const navigation = useNavigation();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<PersistedCookRecipe[]>([]);

  useEffect(() => {
    storageService.getItem("myRecipes").then((saved) => {
      setRecipes(saved ?? []);
    });
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="chef-hat"
        size={scale(48)}
        color={colors.textTertiary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t("noRecipesYet")}
      </Text>
      <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
        {t("noRecipesYetBody")}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: PersistedCookRecipe }) => {
    const cal = item.recipe.nutrition?.calories;
    const protein = item.recipe.nutrition?.protein;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("CookRecipe", { recipe: item.recipe })}
        style={[styles.row, { backgroundColor: colors.surface }]}
        activeOpacity={0.7}
      >
        {item.imageUrl ? (
          <FastImage
            source={{ uri: item.imageUrl }}
            style={styles.thumb}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
            <MaterialCommunityIcons
              name="chef-hat"
              size={scale(28)}
              color={colors["color-success-500"]}
            />
          </View>
        )}
        <View style={styles.rowInfo}>
          <Text
            style={[styles.rowTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.recipe.title}
          </Text>
          {(cal != null || protein != null) && (
            <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>
              {[
                cal != null && `${cal} ${t("cal")}`,
                protein != null && `${protein}g ${t("proteins")}`,
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={scale(20)}
          color={colors.textTertiary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect="clear"
        style={[styles.header, { paddingTop: top }]}
      >
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={scale(28)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("myRecipes")}
        </Text>
        <View style={styles.headerSpacer} />
      </LiquidGlassView>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.savedAt + item.recipe.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: top + scale(70), paddingBottom: bottom + scale(24) },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: scale(10) }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    zIndex: 1,
    width: "100%",
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...fontStyles.headline1,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: scale(40),
  },
  listContent: {
    paddingHorizontal: scale(20),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(20),
    padding: scale(12),
    gap: scale(14),
  },
  thumb: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(14),
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: {
    flex: 1,
    gap: scale(4),
  },
  rowTitle: {
    ...fontStyles.headline3,
  },
  rowMeta: {
    ...fontStyles.caption,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scale(80),
    gap: scale(12),
    paddingHorizontal: scale(32),
  },
  emptyTitle: {
    ...fontStyles.headline2,
    textAlign: "center",
  },
  emptyBody: {
    ...fontStyles.body1,
    textAlign: "center",
  },
});

export default MyRecipesScreen;
