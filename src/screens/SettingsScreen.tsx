import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useOnboardingStore, {
  OnboardingStore,
} from "../zustand/useOnboardingStore";
import { useTranslation } from "react-i18next";
import { fontStyles } from "../theme/fontStyles";
import useAuthService from "../services/auth";
import { goalItems } from "./OnboardingScreen/components/Goal";
import useUserStore, { UserStore } from "../zustand/useUserStore";

type GoalItem = { title: string; key: string };
type LanguageOption = { code: string; name: string; localName: string };

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const authService = useAuthService();
  const { top, bottom } = useSafeAreaInsets();

  const userStore = useUserStore() as UserStore;

  const { goals, height, weight } = (userStore.user as OnboardingStore) || {};

  const [localWeight, setLocalWeight] = useState(
    weight ? weight.toString() : ""
  );
  const [localHeight, setLocalHeight] = useState(
    height ? height.toString() : ""
  );
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  // Language options - easily expandable for future languages
  const languageOptions: LanguageOption[] = [
    { code: "en", name: "English", localName: "English" },
    { code: "tr", name: "Turkish", localName: "Türkçe" },
    // Add more languages here in the future
  ];

  const [selectedGoals, setSelectedGoals] = useState<GoalItem[]>(goals || []);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsLanguageModalVisible(false);
  };

  const toggleGoal = (goal: GoalItem) => {
    if (selectedGoals.some((g) => g.key === goal.key)) {
      setSelectedGoals(selectedGoals.filter((g) => g.key !== goal.key));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const saveChanges = () => {
    // Validate inputs
    const weightNum = parseFloat(localWeight);
    const heightNum = parseFloat(localHeight);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert(
        t("settings.validationError"),
        t("settings.enterValidNumbers")
      );
      return;
    }

    const onboardingState = useUserStore.getState().user;

    useUserStore.setState({
      user: {
        ...onboardingState,
        weight: weightNum,
        height: heightNum,
        goals: selectedGoals,
      },
    });

    navigation.goBack();
  };

  // Find current language name
  const currentLanguage =
    languageOptions.find((lang) => lang.code === i18n.language) ||
    languageOptions[0];

  return (
    <View style={[styles.container, { paddingTop: 0, paddingBottom: 0 }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={scale(40)}
          color={colors["color-primary-500"]}
          onPress={navigation.goBack}
        />

        <Text style={styles.title}>{t("settingsTitle")}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("language")}</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setIsLanguageModalVisible(true)}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name="translate"
                  size={scale(20)}
                  color={colors["color-primary-500"]}
                  style={styles.icon}
                />
                <Text style={styles.settingLabel}>
                  {currentLanguage.localName}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scale(24)}
                color={colors["color-primary-400"]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile")}</Text>
          <View style={styles.card}>
            {/* Weight */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t("weight")}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={localWeight}
                  onChangeText={setLocalWeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.inputUnit}>kg</Text>
              </View>
            </View>

            {/* Height */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t("height")}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={localHeight}
                  onChangeText={setLocalHeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("goals")}</Text>
          <View style={styles.card}>
            {goalItems.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={styles.goalRow}
                onPress={() => toggleGoal(goal)}
              >
                <Text style={styles.goalText}>{t(goal.titleKey)}</Text>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedGoals.some((g) => g.key === goal.key) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selectedGoals.some((g) => g.key === goal.key) && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color="white"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={authService.logout} style={styles.card}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("settings.selectLanguage")}
              </Text>
              <TouchableOpacity
                onPress={() => setIsLanguageModalVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={scale(24)}
                  color={colors["color-primary-500"]}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languageOptions}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    item.code === i18n.language &&
                      styles.languageOptionSelected,
                  ]}
                  onPress={() => changeLanguage(item.code)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      item.code === i18n.language &&
                        styles.languageTextSelected,
                    ]}
                  >
                    {item.localName}
                  </Text>
                  {item.code === i18n.language && (
                    <Ionicons
                      name="checkmark"
                      size={scale(24)}
                      color={colors["color-primary-500"]}
                    />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.languageList}
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.saveButton, { marginBottom: bottom + scale(16) }]}
        onPress={saveChanges}
      >
        <Text style={styles.buttonText}>{t("saveChanges")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    paddingHorizontal: scale(24),
    paddingVertical: scale(16),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  title: {
    ...fontStyles.headline1,
    color: colors["color-primary-500"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: scale(120),
  },
  section: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
  },
  card: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(8),
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: scale(8),
  },
  settingLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  inputRow: {
    marginBottom: scale(16),
  },
  inputLabel: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    marginBottom: scale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors["color-primary-300"],
    borderRadius: scale(12),
    height: scale(48),
    paddingHorizontal: scale(12),
  },
  input: {
    flex: 1,
    ...fontStyles.body1,
    height: scale(48),
    color: colors["color-primary-500"],
  },
  inputUnit: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    width: scale(24),
    textAlign: "center",
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors["color-primary-100"],
  },
  goalText: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  checkboxContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(4),
    borderWidth: 2,
    borderColor: colors["color-primary-300"],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors["color-primary-500"],
    borderColor: colors["color-primary-500"],
  },
  saveButton: {
    backgroundColor: colors["color-success-400"],
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginHorizontal: scale(24),
    position: "absolute",
    bottom: scale(16),
    left: 0,
    right: 0,
  },
  buttonText: {
    ...fontStyles.headline4,
    color: "white",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingBottom: scale(32),
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(24),
    borderBottomWidth: 1,
    borderBottomColor: colors["color-primary-100"],
  },
  modalTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
  languageList: {
    paddingHorizontal: scale(16),
  },
  languageOption: {
    paddingVertical: scale(16),
    paddingHorizontal: scale(8),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageOptionSelected: {
    // backgroundColor: colors["color-primary-100"],
  },
  languageText: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  languageTextSelected: {
    fontWeight: "bold",
  },
});

export default SettingsScreen;
