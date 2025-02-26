import { User } from "@react-native-google-signin/google-signin";
import { create } from "zustand";

type UserStore = {
  user: User | null;
};

const useUserStore = create<UserStore>(() => ({
  user: null,
}));

export default useUserStore;
