import * as Amplitude from "@amplitude/analytics-react-native";

export enum AnalyticsEvent {
  FirstLaunch = "first_launch",
  StartOnboarding = "start_onboarding",
  OnboardingFinished = "onboarding_finished",
  SignIn = "sign_in",
  SignUp = "sign_up",
  DeleteUser = "delete_user",
  MealLogged = "meal_logged",
  MealLogError = "meal_log_error",
}

export type MealLoggedParams = {
  type: "scan" | "text";
  description: string;
};

export type OnboardingFinishedParams = {
  goals?: string[];
  gender?: string | null;
  yearOfBirth?: number;
  weight?: number | null;
  height?: number | null;
  dietTypes?: string[];
};

type EventParams = {
  [AnalyticsEvent.FirstLaunch]: undefined;
  [AnalyticsEvent.StartOnboarding]: undefined;
  [AnalyticsEvent.OnboardingFinished]: OnboardingFinishedParams;
  [AnalyticsEvent.SignIn]: undefined;
  [AnalyticsEvent.SignUp]: undefined;
  [AnalyticsEvent.DeleteUser]: undefined;
  [AnalyticsEvent.MealLogged]: MealLoggedParams;
  [AnalyticsEvent.MealLogError]: undefined;
};

interface IAnalyticsProvider {
  init(apiKey: string): void;
  logEvent<T extends AnalyticsEvent>(event: T, params?: EventParams[T]): void;
  setUserId(userId: string | null): void;
}

class AmplitudeProvider implements IAnalyticsProvider {
  init(apiKey: string): void {
    Amplitude.init(apiKey, undefined, {
      disableCookies: true,
    });
  }

  logEvent<T extends AnalyticsEvent>(event: T, params?: EventParams[T]): void {
    if (params) {
      Amplitude.track(event, params);
    } else {
      Amplitude.track(event);
    }
  }

  setUserId(userId: string | null): void {
    if (userId) {
      Amplitude.setUserId(userId);
    } else {
      Amplitude.reset();
    }
  }
}

class AnalyticsService {
  private provider: IAnalyticsProvider;
  private initialized = false;

  constructor(provider: IAnalyticsProvider = new AmplitudeProvider()) {
    this.provider = provider;
  }

  init(apiKey: string): void {
    if (this.initialized) {
      return;
    }
    this.provider.init(apiKey);
    this.initialized = true;
  }

  logEvent<T extends AnalyticsEvent>(event: T, params?: EventParams[T]): void {
    if (!this.initialized) {
      console.warn("Analytics not initialized. Call init() first.");
      return;
    }
    this.provider.logEvent(event, params);
  }

  setUserId(userId: string | null): void {
    this.provider.setUserId(userId);
  }

  setProvider(provider: IAnalyticsProvider): void {
    this.provider = provider;
  }
}

export const analyticsService = new AnalyticsService();
