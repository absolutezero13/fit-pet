import { GoogleSignin } from "@react-native-google-signin/google-signin";
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
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
} from "@react-native-firebase/auth";
import api from "./api";
import userService from "./user";
import { Alert } from "react-native";
import { getCrashlytics } from "@react-native-firebase/crashlytics";

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
    type: LoginType
  ): Promise<{ success: boolean; user?: IUser }> {
    let response: { success: boolean };
    switch (type) {
      case LoginType.Google:
        response = await this.handleGoogleLogin();
        break;
      case LoginType.Anonymous:
        response = await this.handleAnonymousLogin();
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
      default:
        throw new Error("Invalid login type");
    }
  }

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

  private async handleGoogleLogin() {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      if (!user?.data?.idToken) {
        return { success: false };
      }

      const googleCredential = auth.GoogleAuthProvider.credential(
        user.data?.idToken
      );
      await getAuth().signInWithCredential(googleCredential);
      const response = await api.post("/auth/login/google", {
        idToken: await getAuth().currentUser?.getIdToken(),
      });

      console.log("Google login response:", response.data);
      if (response.data) {
        const { user } = response.data;
        storageService.setItem("User", user);
        return {
          success: true,
          user,
        };
      }
      return {
        success: false,
      };
    } catch (error) {
      console.log(
        "Error during Google login:",
        error instanceof Error ? error : "Unknown error"
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
