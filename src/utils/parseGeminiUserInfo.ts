import { GeminiUserInfo, IUser } from "../zustand/useUserStore";

const parseGeminiUserInfo = (userInfo: IUser): GeminiUserInfo => {
  return {
    onboarding: userInfo.onboarding,
    macroGoals: userInfo.macroGoals,
  };
};

export default parseGeminiUserInfo;
