import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useUserStore from "../zustand/useUserStore";
import useMealsStore, {
  INITIAL_LOGGED_MEAL_STATE,
} from "../zustand/useMealsStore";
import useOnboardingStore, {
  INITIAL_ONBOARDING_STATE,
} from "../zustand/useOnboardingStore";
import { storageService } from "../storage/AsyncStorageService";
import { NavigationProp } from "@react-navigation/native";
import auth, {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from "@react-native-firebase/auth";

export enum LoginType {
  Google,
}

class AuthService {
  public async handleLogin(type: LoginType): Promise<{ success: boolean }> {
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

  public async checkUser(): Promise<{ success: boolean }> {
    if (!GoogleSignin.hasPreviousSignIn()) {
      return {
        success: false,
      };
    }
    const user = GoogleSignin.getCurrentUser();

    if (!user) {
      return {
        success: false,
      };
    }

    // useUserStore.setState({ user });

    return {
      success: true,
    };
  }

  private async handleGoogleLogin() {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      console.log("Current User: ", currentUser);
      const res = await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data?.idToken ?? null
      );

      auth().signInWithCredential(googleCredential);

      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  }

  public async handleAnonymousLogin() {
    try {
      const userCredential = await signInAnonymously(auth());
      const user = userCredential.user;
      console.log("Anonymous User: ", user);
      return {
        success: true,
      };
    } catch (error) {
      console.log("Anonymous login error: ", error);
      return {
        success: false,
      };
    }
  }

  public async logout(navigationRef: any) {
    useMealsStore.setState(INITIAL_LOGGED_MEAL_STATE);
    useUserStore.setState({ user: null });
    useOnboardingStore.setState(INITIAL_ONBOARDING_STATE);
    // await GoogleSignin.revokeAccess();
    // await GoogleSignin.signOut();
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
