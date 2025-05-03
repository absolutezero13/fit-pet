import { ENDPOINT } from "./api";
import auth from "@react-native-firebase/auth";

export const checkApi = async () => {
  try {
    const res = await fetch(ENDPOINT);
    const data = await res.json();
    if (res.status === 401) {
      if (auth().currentUser) {
      }
    }

    return data;
  } catch (error) {
    console.log("API ERROR", error);
    return error as any;
  }
};
