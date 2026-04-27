import {
  SheetScrollView,
  SheetTextInput,
  TrueSheet,
  type FocusableInput,
} from "../../../components/TrueSheet";
import { TrueSheetNames } from "../../../navigation/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fontStyles } from "../../../theme/fontStyles";
import { useState, useRef, useEffect } from "react";
import AppButton from "../../../components/AppButton";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import useAuthService, { LoginType } from "../../../services/auth";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const SignUpTrueSheet = () => {
  const { t } = useTranslation();
  const authService = useAuthService();
  const { colors, isDark } = useTheme();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const disabled =
    !email || !password || !confirmPassword || password.length < 6;
  const emailInputRef = useRef<FocusableInput | null>(null);
  const [loading, setLoading] = useState(false);
  const styles = makeStyles(colors);

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

  const handleLoginPress = async () => {
    await TrueSheet.dismiss(TrueSheetNames.SIGN_UP);
    TrueSheet.present(TrueSheetNames.LOGIN);
  };

  const signUpOptionsContent = (
    <View style={styles.buttonsContainer}>
      {signUpOptions.map((option) => (
        <Pressable
          key={option.type}
          onPress={option.onPress}
          style={[styles.googleButton, { opacity: option.disabled ? 0.5 : 1 }]}
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
  );

  const emailFormContent = (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t("email")}</Text>
        <SheetTextInput
          ref={emailInputRef}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t("enterEmail")}
          placeholderTextColor={colors.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t("password")}</Text>
        <SheetTextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t("enterPassword")}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t("confirmPassword")}</Text>
        <SheetTextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("confirmYourPassword")}
          placeholderTextColor={colors.textTertiary}
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
    </>
  );

  const content = (
    <>
      <View style={styles.header}>
        {showEmailForm && (
          <Pressable
            onPress={() => setShowEmailForm(false)}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={scale(24)}
              color={colors.text}
            />
          </Pressable>
        )}
        <Text style={styles.title}>{t("signUpTitle")}</Text>
        {!showEmailForm && (
          <Text style={styles.subtitle}>{t("signUpSubtitle")}</Text>
        )}
      </View>

      {!showEmailForm ? (
        Platform.OS === "ios" ? (
          <KeyboardGestureArea
            interpolator="ios"
            offset={scale(50)}
            textInputNativeID="composer"
            style={{
              flex: 1,
            }}
          >
            {signUpOptionsContent}
          </KeyboardGestureArea>
        ) : (
          signUpOptionsContent
        )
      ) : Platform.OS === "ios" ? (
        <View style={styles.emailFormContainer}>{emailFormContent}</View>
      ) : (
        emailFormContent
      )}

      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>{t("alreadyHaveAccount")} </Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.loginLink}>{t("logIn")}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.termsText}>
          {t("termsAgreement")}{" "}
          <Text style={styles.termsLink}>{t("termsOfService")}</Text> {t("and")}{" "}
          <Text style={styles.termsLink}>{t("privacyPolicy")}</Text>
          {t("termsAgreementEnd")}
        </Text>
      </View>
    </>
  );

  return (
    <TrueSheet
      onDidDismiss={onDidDismiss}
      name={TrueSheetNames.SIGN_UP}
      detents={["auto", 1]}
      insetAdjustment="never"
      blurTint={
        isDark ? "system-thick-material-dark" : "system-thick-material-light"
      }
      backgroundColor={colors.background}
      dismissible={!loading}
      keyboardBehavior={Platform.OS === "android" ? "fillParent" : undefined}
      scrollable={Platform.OS === "android"}
      blurOptions={{
        interaction: false,
      }}
    >
      {Platform.OS === "android" ? (
        <SheetScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {content}
        </SheetScrollView>
      ) : (
        <View style={styles.container}>{content}</View>
      )}
    </TrueSheet>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
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
      top: scale(4),
      padding: scale(4),
      zIndex: 1,
    },
    title: {
      ...fontStyles.headline1,
      marginBottom: scale(12),
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      ...fontStyles.body1,
      textAlign: "center",
      color: colors.textSecondary,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    googleButtonText: {
      ...fontStyles.headline4,
      fontSize: scale(16),
      color: colors.text,
    },
    footer: {
      alignItems: "center",
      gap: scale(12),
    },
    footerTextContainer: {
      alignItems: "center",
      flexDirection: "row",
    },
    footerText: {
      ...fontStyles.body2,
      fontSize: scale(14),
      textAlign: "center",
      color: colors.textSecondary,
    },
    loginLink: {
      color: colors.text,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    termsText: {
      ...fontStyles.caption,
      fontSize: scale(12),
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: scale(18),
    },
    termsLink: {
      color: colors.text,
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
      color: colors.text,
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
