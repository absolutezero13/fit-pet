import React, { FC } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
} from "react-native";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "i18next";

type Props = {
  visible: boolean;
  onClose: () => void;
  options: {
    code: string;
    localName: string;
    name: string;
  }[];
};

const LanguageSelection: FC<Props> = ({ visible, onClose, options }) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("settings.selectLanguage")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={scale(24)}
                color={colors["color-primary-500"]}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  item.code === i18n.language && styles.languageOptionSelected,
                ]}
                onPress={() => changeLanguage(item.code)}
              >
                <Text
                  style={[
                    styles.languageText,
                    item.code === i18n.language && styles.languageTextSelected,
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
  );
};

export default LanguageSelection;
const styles = StyleSheet.create({
  buttonText: {
    ...fontStyles.headline4,
    color: "white",
  },
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
