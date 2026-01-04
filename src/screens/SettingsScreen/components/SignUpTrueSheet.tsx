import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TrueSheetNames } from "../../../navigation/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import { colors } from "../../../theme/colors";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fontStyles } from "../../../theme/fontStyles";
import { useState, useRef, useEffect } from "react";
import AppButton from "../../../components/AppButton";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import useAuthService, { LoginType } from "../../../services/auth";
import { useTranslation } from "react-i18next";

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const SignUpTrueSheet = () => {
  const { t } = useTranslation();
  const authService = useAuthService();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const disabled =
    !email || !password || !confirmPassword || password.length < 6;
  const emailInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (showEmailForm && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [showEmailForm]);

  const handleEmailSignUp = async () => {
    if (!isValidEmail(email)) {
      Alert.alert(t("invalidEmail"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    await authService.linkUser(LoginType.Email, email, password);
    setLoading(false);
    TrueSheet.dismiss(TrueSheetNames.SIGN_UP);
  };

  const handleSocialSignUp = async (type: LoginType) => {
    setLoading(true);
    await authService.linkUser(type);
    setLoading(false);
    TrueSheet.dismiss(TrueSheetNames.SIGN_UP);
  };

  const signUpOptions = [
    {
      type: LoginType.Google,
      label: t("signUpWithGoogle"),
      icon: "google",
      onPress: () => handleSocialSignUp(LoginType.Google),
      disabled: false,
      filter: () => true,
    },
    {
      type: LoginType.Apple,
      label: t("signUpWithApple"),
      icon: "apple",
      onPress: () => handleSocialSignUp(LoginType.Apple),
      filter: () => Platform.OS === "ios",
    },
    {
      type: LoginType.Email,
      label: t("signUpWithEmail"),
      icon: "email",
      onPress: () => setShowEmailForm(true),
      filter: () => true,
    },
  ].filter((option) => option.filter?.());

  const onDidDismiss = () => {
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  return (
    <TrueSheet
      onDidDismiss={onDidDismiss}
      name={TrueSheetNames.SIGN_UP}
      detents={["auto", 1]}
      insetAdjustment="never"
      blurTint="dark"
      style={styles.container}
    >
      <View style={styles.header}>
        {showEmailForm && (
          <Pressable
            onPress={() => setShowEmailForm(false)}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={scale(24)}
              color={colors["color-primary-50"]}
            />
          </Pressable>
        )}
        <Text style={styles.title}>{t("signUpTitle")}</Text>
        {!showEmailForm && (
          <Text style={styles.subtitle}>{t("signUpSubtitle")}</Text>
        )}
      </View>

      {!showEmailForm ? (
        <KeyboardGestureArea
          interpolator="ios"
          offset={scale(50)}
          textInputNativeID="composer"
          style={{
            flex: 1,
          }}
        >
          <View style={styles.buttonsContainer}>
            {signUpOptions.map((option) => (
              <Pressable
                key={option.type}
                onPress={option.onPress}
                style={[
                  styles.googleButton,
                  { opacity: option.disabled ? 0.5 : 1 },
                ]}
                disabled={option.disabled}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={scale(24)}
                  color={colors["color-primary-500"]}
                />
                <Text style={styles.googleButtonText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </KeyboardGestureArea>
      ) : (
        <View style={styles.emailFormContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("email")}</Text>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t("enterEmail")}
              placeholderTextColor={colors["color-primary-300"]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("password")}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t("enterPassword")}
              placeholderTextColor={colors["color-primary-300"]}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("confirmPassword")}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("confirmYourPassword")}
              placeholderTextColor={colors["color-primary-300"]}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <AppButton
            title={t("signUp")}
            onPress={handleEmailSignUp}
            backgroundColor={colors["color-primary-50"]}
            color={colors["color-primary-500"]}
            margin={{ marginTop: scale(8) }}
            disabled={disabled}
            loading={loading}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t("alreadyHaveAccount")}{" "}
          <Text style={styles.loginLink}>{t("logIn")}</Text>
        </Text>
        <Text style={styles.termsText}>
          {t("termsAgreement")}{" "}
          <Text style={styles.termsLink}>{t("termsOfService")}</Text> {t("and")}{" "}
          <Text style={styles.termsLink}>{t("privacyPolicy")}</Text>
          {t("termsAgreementEnd")}
        </Text>
      </View>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: scale(24),
    paddingHorizontal: scale(24),
    paddingBottom: scale(24),
  },
  header: {
    alignItems: "center",
    marginBottom: scale(32),
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: scale(4),
    zIndex: 1,
  },
  title: {
    ...fontStyles.headline1,
    marginBottom: scale(12),
    textAlign: "center",
    color: colors["color-primary-50"],
  },
  subtitle: {
    ...fontStyles.body1,
    textAlign: "center",
    color: colors["color-primary-50"],
  },
  buttonsContainer: {
    gap: scale(16),
    marginBottom: scale(24),
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(12),
    padding: scale(16),
    borderRadius: scale(12),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  googleButtonText: {
    ...fontStyles.headline4,
    fontSize: scale(16),
    fontWeight: "600",
    color: "#1F2937",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(12),
    padding: scale(16),
    borderRadius: scale(12),
    backgroundColor: colors["color-primary-50"],
  },
  appleButtonText: {
    ...fontStyles.headline4,
    fontSize: scale(16),
    fontWeight: "600",
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(12),
    padding: scale(16),
    borderRadius: scale(12),
    backgroundColor: colors["color-primary-100"],
    borderWidth: 1,
    borderColor: colors["color-primary-200"],
  },
  emailButtonText: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
  },
  footer: {
    alignItems: "center",
    gap: scale(12),
  },
  footerText: {
    ...fontStyles.body2,
    fontSize: scale(14),
    textAlign: "center",
    color: colors["color-primary-50"],
  },
  loginLink: {
    color: colors["color-primary-50"],
    fontWeight: "600",
  },
  termsText: {
    ...fontStyles.caption,
    fontSize: scale(12),
    color: colors["color-primary-50"],
    textAlign: "center",
    lineHeight: scale(18),
  },
  termsLink: {
    textDecorationLine: "underline",
  },
  emailFormContainer: {
    gap: scale(16),
    marginBottom: scale(24),
  },
  inputContainer: {
    gap: scale(4),
  },
  inputLabel: {
    ...fontStyles.headline4,
    fontSize: scale(14),
    fontWeight: "600",
    color: colors["color-primary-50"],
  },
  input: {
    ...fontStyles.body1,
    fontSize: scale(16),
    backgroundColor: colors["color-primary-100"],
    borderWidth: 1,
    borderColor: colors["color-primary-200"],
    borderRadius: scale(12),
    padding: scale(16),
    color: colors["color-primary-500"],
  },
});
export default SignUpTrueSheet;
