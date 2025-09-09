import axios from "axios";
import auth from "@react-native-firebase/auth";
import { Platform } from "react-native";

export const LIVE_ENDPOINT =
  "https://fit-pet-be-git-master-absolutezero13s-projects.vercel.app/api";

const DEV_ENDPOINT = Platform.select({
  default: "http://localhost:3000/api",
});

export const ENDPOINT = DEV_ENDPOINT;

const api = axios.create({
  baseURL: ENDPOINT,
});

api.interceptors.request.use(async (config) => {
  const token = await auth().currentUser?.getIdToken();
  console.log("API TOKEN", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
