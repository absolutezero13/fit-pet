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
import auth from "@react-native-firebase/auth";
import api from "./api";

export enum LoginType {
  Google,
}

class AuthService {
  public async handleLogin(
    type: LoginType
  ): Promise<{ success: boolean; user?: IUser }> {
    let response: { success: boolean };
    switch (type) {
      case LoginType.Google:
        response = await this.handleGoogleLogin();
        break;
      default:
        throw new Error("Invalid login type");
    }

    return response;
  }

  private async handleGoogleLogin() {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      console.log("Google user data:", user.data);
      if (!user?.data?.idToken) {
        return { success: false };
      }

      console.log("Google user data:", user.data);

      const googleCredential = auth.GoogleAuthProvider.credential(
        user.data?.idToken
      );
      await auth().signInWithCredential(googleCredential);
      const response = await api.post("/auth/login/google", {
        idToken: await auth().currentUser?.getIdToken(),
      });

      if (response.data) {
        const { user } = response.data;
        console.log("User data from server:", user);
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
        error instanceof Error ? error.message : "Unknown error"
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
    await auth().signOut();

    storageService.removeItem("User");
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
