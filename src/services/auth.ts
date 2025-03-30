import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useUserStore from "../zustand/useUserStore";
import useLoggedMealsStore, {
  INITIAL_LOGGED_MEAL_STATE,
} from "../zustand/useLoggedMealsStore";
import useOnboardingStore, {
  INITIAL_ONBOARDING_STATE,
} from "../zustand/useOnboardingStore";
import { navigationRef } from "../App";
import { storageService } from "../storage/AsyncStorageService";

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

    useUserStore.setState({ user });

    return {
      success: true,
    };
  }

  private async handleGoogleLogin() {
    try {
      const res = await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      useUserStore.setState({ user: userInfo.data });
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

  public async logout() {
    //TODO: Implement logout API

    useLoggedMealsStore.setState(INITIAL_LOGGED_MEAL_STATE);
    useUserStore.setState({ user: null });
    useOnboardingStore.setState(INITIAL_ONBOARDING_STATE);
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });

    storageService.removeItem("User");
  }
}

const useAuthService = () => {
  return new AuthService();
};

export default useAuthService;
