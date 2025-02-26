import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useUserStore from "../zustand/useUserStore";

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
}

const useAuthService = () => {
  return new AuthService();
};

export default useAuthService;
