import auth from "@react-native-firebase/auth";
import { Platform } from "react-native";
export const LIVE_ENDPOINT =
  "https://fit-pet-be-git-master-absolutezero13s-projects.vercel.app/api";

const DEV_ENDPOINT = Platform.select({
  ios: "http://localhost:3000/api",
  default: "http://10.0.2.2:3000/api",
});

console.log("API ENDPOINT", DEV_ENDPOINT);

export const ENDPOINT = DEV_ENDPOINT;

export const getCommonHeaders = async () => {
  const token = await auth().currentUser?.getIdToken(true);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
