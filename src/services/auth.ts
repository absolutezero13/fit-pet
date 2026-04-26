import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import useUserStore, {
  INITIAL_USER_STORE,
  IUser,
} from "../zustand/useUserStore";
import useMealsStore, {
  INITIAL_LOGGED_MEAL_STATE,
} from "../zustand/useMealsStore";
import useOnboardingStore, {
  INITIAL_ONBOARDING_STATE,
} from "../zustand/useOnboardingStore";
import { storageService } from "../storage/AsyncStorageService";
import auth, {
  AppleAuthProvider,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
} from "@react-native-firebase/auth";
import api from "./api";
import userService from "./user";
import { Alert } from "react-native";
import { getCrashlytics } from "@react-native-firebase/crashlytics";
import AppleAuthentication from "@invertase/react-native-apple-authentication";
import { analyticsService, AnalyticsEvent } from "./analytics";

const GOOGLE_WEB_CLIENT_ID =
  "315038553874-o6io0tpi22tvod4t1ofrhj2j9naki8ce.apps.googleusercontent.com";

export enum LoginType {
  Google,
  Anonymous,
  Apple,
  Email,
}

export class AuthService {
  constructor() {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }

  public async handleLogin(
    type: LoginType,
    email?: string,
    password?: string,
  ): Promise<{ success: boolean; user?: IUser; cancelled?: boolean }> {
    let response: { success: boolean; user?: IUser };
    switch (type) {
      case LoginType.Google:
        response = await this.handleGoogleLogin();
        break;
      case LoginType.Anonymous:
        response = await this.handleAnonymousLogin();
        break;
      case LoginType.Apple:
        response = await this.handleAppleLogin();
        break;
      case LoginType.Email:
        response = await this.handleEmailLogin(email, password);
        break;
      default:
        throw new Error("Invalid login type");
    }

    return response;
  }

  public async linkUser(type: LoginType, email?: string, password?: string) {
    switch (type) {
      case LoginType.Google:
        return this.linkAnonymousToGoogle();
      case LoginType.Email:
        return this.linkAnonymousToEmail(email, password);
      case LoginType.Apple:
        return this.linkAnonymousToApple();
      default:
        throw new Error("Invalid login type");
    }
  }

  private linkAnonymousToApple = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.isAnonymous) {
      throw new Error("No anonymous user to link");
    }

    try {
      const appleResponse = await AppleAuthentication.performRequest({
        requestedOperation: AppleAuthentication.Operation.LOGIN,
        requestedScopes: [
          AppleAuthentication.Scope.EMAIL,
          AppleAuthentication.Scope.FULL_NAME,
        ],
      });

      const appleCredential = AppleAuthProvider.credential(
        appleResponse.identityToken,
        appleResponse.nonce,
      );
      const result = await user.linkWithCredential(appleCredential);
      console.log("Linked user UID:", result.user.uid);
      await userService.createOrUpdateUser({
        email: result.user.email ?? undefined,
        displayName: result.user.displayName ?? undefined,
        picture: result.user.photoURL ?? undefined,
      });
      await userService.getUser();
      analyticsService.logEvent(AnalyticsEvent.SignUp);
      return result.user;
    } catch (error: any) {
      Alert.alert("Error linking Apple account", error.message);
      getCrashlytics().recordError(error);
      throw error;
    }
  };
  private linkAnonymousToEmail = async (email?: string, password?: string) => {
    if (!email || !password) {
      Alert.alert("Email and password are required");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.isAnonymous) {
      throw new Error("No anonymous user to link");
    }

    try {
      const emailCredential = EmailAuthProvider.credential(email, password);

      const result = await user.linkWithCredential(emailCredential);
      console.log("Linked user UID:", result.user.uid);

      await userService.createOrUpdateUser({
        email: result.user.email ?? undefined,
        displayName: result.user.displayName ?? undefined,
        picture: result.user.photoURL ?? undefined,
      });
      await userService.getUser();
      analyticsService.logEvent(AnalyticsEvent.SignUp);
      return result.user;
    } catch (error: any) {
      getCrashlytics().recordError(error);
      throw error;
    }
  };

  private async handleAnonymousLogin() {
    try {
      await getAuth().signInAnonymously();
      const response = await api.post("/auth/login/google", {
        idToken: await getAuth().currentUser?.getIdToken(),
      });
      return { success: true, user: response.data.user };
    } catch (error) {
      getCrashlytics().recordError(error as Error);
      return { success: false };
    }
  }

  private async handleAppleLogin(): Promise<{
    success: boolean;
    user?: IUser;
  }> {
    try {
      const appleResponse = await AppleAuthentication.performRequest({
        requestedOperation: AppleAuthentication.Operation.LOGIN,
        requestedScopes: [
          AppleAuthentication.Scope.EMAIL,
          AppleAuthentication.Scope.FULL_NAME,
        ],
      });

      const appleCredential = AppleAuthProvider.credential(
        appleResponse.identityToken,
        appleResponse.nonce,
      );
      await getAuth().signInWithCredential(appleCredential);

      const response = await api.post("/auth/login/google", {
        idToken: await getAuth().currentUser?.getIdToken(),
      });

      if (response.data) {
        const { user } = response.data;
        storageService.setItem("User", user);
        analyticsService.logEvent(AnalyticsEvent.SignIn);
        return { success: true, user };
      }
      return { success: false };
    } catch (error) {
      getCrashlytics().recordError(error as Error);
      return { success: false };
    }
  }

  private async handleEmailLogin(
    email?: string,
    password?: string,
  ): Promise<{ success: boolean; user?: IUser }> {
    if (!email || !password) {
      return { success: false };
    }

    try {
      await getAuth().signInWithEmailAndPassword(email, password);

      const response = await api.post("/auth/login/google", {
        idToken: await getAuth().currentUser?.getIdToken(),
      });

      if (response.data) {
        const { user } = response.data;
        storageService.setItem("User", user);
        analyticsService.logEvent(AnalyticsEvent.SignIn);
        return { success: true, user };
      }
      return { success: false };
    } catch (error) {
      getCrashlytics().recordError(error as Error);
      return { success: false };
    }
  }

  private linkAnonymousToGoogle = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.isAnonymous) {
      getCrashlytics().recordError(new Error("No anonymous user to link"));
      return { success: false };
    }

    try {
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();

      const googleCredential = GoogleAuthProvider.credential(data?.idToken);

      const result = await user.linkWithCredential(googleCredential);

      await userService.createOrUpdateUser({
        email: result.user.email ?? undefined,
        displayName: result.user.displayName ?? undefined,
        picture: result.user.photoURL ?? undefined,
      });
      await userService.getUser();
      analyticsService.logEvent(AnalyticsEvent.SignUp);
      return result.user;
    } catch (error) {
      // if (error.code === "auth/credential-already-in-use") {
      //   // Handle case where Google account already exists
      //   // await handleExistingAccount(error);
      // } else if (error.code === "auth/email-already-in-use") {
      //   // Handle email conflict
      // }
      throw error;
    }
  };

  private async handleGoogleLogin(): Promise<{
    success: boolean;
    user?: IUser;
    cancelled?: boolean;
  }> {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      if (isCancelledResponse(signInResult)) {
        return { success: false, cancelled: true };
      }
      if (!isSuccessResponse(signInResult) || !signInResult.data.idToken) {
        return { success: false };
      }

      const googleCredential = auth.GoogleAuthProvider.credential(
        signInResult.data.idToken,
      );
      await getAuth().signInWithCredential(googleCredential);
      const response = await api.post("/auth/login/google", {
        idToken: await getAuth().currentUser?.getIdToken(),
      });

      console.log("Google login response:", response.data);
      if (response.data) {
        const { user } = response.data;
        storageService.setItem("User", user);
        analyticsService.logEvent(AnalyticsEvent.SignIn);
        return {
          success: true,
          user,
        };
      }
      return {
        success: false,
      };
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return { success: false, cancelled: true };
      }
      console.log(
        "Error during Google login:",
        error instanceof Error ? error : "Unknown error",
      );
      return {
        success: false,
      };
    }
  }

  public async logout(navigationRef: any) {
    useMealsStore.setState(INITIAL_LOGGED_MEAL_STATE);
    useUserStore.setState(INITIAL_USER_STORE);
    useOnboardingStore.setState(INITIAL_ONBOARDING_STATE);
    await getAuth().signOut();

    storageService.removeItem("User");
    storageService.removeItem("meals");
    storageService.removeItem("token");
    navigationRef?.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  }
}

const useAuthService = () => {
  return new AuthService();
};

export default useAuthService;
