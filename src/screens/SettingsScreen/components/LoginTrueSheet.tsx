import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TrueSheetNames } from "../../../navigation/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import { colors } from "../../../theme/colors";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fontStyles } from "../../../theme/fontStyles";
import { useState, useRef, useEffect } from "react";
import AppButton from "../../../components/AppButton";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import useAuthService, { LoginType } from "../../../services/auth";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import userService from "../../../services/user";
import { IUser } from "../../../zustand/useUserStore";

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

interface LoginTrueSheetProps {
  onLoginSuccess?: () => void;
}

const LoginTrueSheet = ({ onLoginSuccess }: LoginTrueSheetProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const authService = useAuthService();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const disabled = !email || !password || password.length < 6;
  const emailInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showEmailForm && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [showEmailForm]);

  const handleLoginSuccess = async (user: IUser) => {
    TrueSheet.dismiss(TrueSheetNames.LOGIN);

    if (user?.onboardingCompleted) {
      await userService.getUser();
      navigation.reset({
        routes: [{ name: "HomeTabs" as const }],
        index: 0,
      });
    } else {
      navigation.navigate("Onboarding" as never);
    }

    onLoginSuccess?.();
  };

  const handleEmailLogin = async () => {
    if (!isValidEmail(email)) {
      Alert.alert(t("invalidEmail"));
      return;
    }

    setLoading(true);
    const { success, user } = await authService.handleLogin(
      LoginType.Email,
      email,
      password,
    );
    setLoading(false);

    if (!success || !user) {
      Alert.alert(t("error"), t("globalErrorMessage"));
      return;
    }

    await handleLoginSuccess(user);
  };

  const handleSocialLogin = async (type: LoginType) => {
    setLoading(true);
    const { success, user } = await authService.handleLogin(type);
    setLoading(false);

    if (!success || !user) {
      Alert.alert(t("error"), t("globalErrorMessage"));
      return;
    }

    await handleLoginSuccess(user);
  };

  const loginOptions = [
    {
      type: LoginType.Google,
      label: t("loginWithGoogle"),
      icon: "google",
      onPress: () => handleSocialLogin(LoginType.Google),
      disabled: false,
      filter: () => true,
    },
    {
      type: LoginType.Apple,
      label: t("loginWithApple"),
      icon: "apple",
      onPress: () => handleSocialLogin(LoginType.Apple),
      filter: () => Platform.OS === "ios",
    },
    {
      type: LoginType.Email,
      label: t("loginWithEmail"),
      icon: "email",
      onPress: () => setShowEmailForm(true),
      filter: () => true,
    },
  ].filter((option) => option.filter?.());

  const onDidDismiss = () => {
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  return (
    <TrueSheet
      onDidDismiss={onDidDismiss}
      name={TrueSheetNames.LOGIN}
      detents={["auto", 1]}
      insetAdjustment="never"
      blurTint={"system-thick-material-dark"}
      style={styles.container}
      dismissible={!loading}
      backgroundColor={colors.background}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors["color-primary-500"]} />
        </View>
      )}
      {!loading && (
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
                  color={colors["color-primary-50"]}
                />
              </Pressable>
            )}
            <Text style={styles.title}>{t("loginTitle")}</Text>
            {!showEmailForm && (
              <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>
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
                {loginOptions.map((option) => (
                  <Pressable
                    key={option.type}
                    onPress={option.onPress}
                    style={[
                      styles.loginButton,
                      { opacity: option.disabled ? 0.5 : 1 },
                    ]}
                    disabled={option.disabled}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={scale(24)}
                      color={colors["color-primary-500"]}
                    />
                    <Text style={styles.loginButtonText}>{option.label}</Text>
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

              <AppButton
                title={t("logIn")}
                onPress={handleEmailLogin}
                backgroundColor={colors["color-primary-50"]}
                color={colors["color-primary-500"]}
                margin={{ marginTop: scale(8) }}
                disabled={disabled}
                loading={loading}
              />
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerText}>{t("noAccountYet")} </Text>
              <TouchableOpacity
                onPress={() => TrueSheet.dismiss(TrueSheetNames.LOGIN)}
              >
                <Text style={styles.signUpLink}>{t("signUp")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: scale(24),
    paddingHorizontal: scale(24),
    paddingBottom: scale(24),
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
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
  loginButton: {
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
  loginButtonText: {
    ...fontStyles.headline4,
    fontSize: scale(16),
    fontWeight: "600",
    color: "#1F2937",
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
  footer: {
    alignItems: "center",
    gap: scale(12),
  },
  footerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    ...fontStyles.body2,
    fontSize: scale(14),
    textAlign: "center",
    color: colors["color-primary-50"],
  },
  signUpLink: {
    ...fontStyles.body2,
    fontSize: scale(14),
    color: colors["color-primary-50"],
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default LoginTrueSheet;
