import { Text, View, StyleSheet, Pressable } from "react-native";
import { fontStyles } from "../../../theme/fontStyles";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TrueSheetNames } from "../../../navigation/constants";
import { t } from "i18next";
import { useTheme } from "../../../theme/ThemeContext";

const SignUpBanner = () => {
  const { colors } = useTheme();
  const handleSignUp = () => {
    TrueSheet.present(TrueSheetNames.SIGN_UP);
  };

  return (
    <Pressable
      onPress={handleSignUp}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text style={styles.title}>{t("signUpBanner")}</Text>
      <MaterialCommunityIcons
        name="account-plus"
        size={scale(48)}
        color={colors.text}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(24),
    padding: scale(24),
    marginBottom: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...fontStyles.headline2,
    color: "white",
    marginBottom: scale(4),
    flexWrap: "wrap",
    width: "80%",
  },
  subtitle: {
    ...fontStyles.body1,
    marginBottom: scale(4),
  },
  button: {
    backgroundColor: "white",
    paddingVertical: scale(14),
    paddingHorizontal: scale(24),
    borderRadius: scale(24),
    alignSelf: "flex-start",
  },
  buttonText: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
  },
});

export default SignUpBanner;
