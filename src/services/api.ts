import axios from "axios";
import auth from "@react-native-firebase/auth";
import { Platform } from "react-native";

export const LIVE_ENDPOINT = "https://fit-pet-be.vercel.app/api";

const DEV_ENDPOINT = Platform.select({
  ios: "http://192.168.1.23:3000/api",
});

export const ENDPOINT = LIVE_ENDPOINT;

const api = axios.create({
  baseURL: ENDPOINT,
});

api.interceptors.request.use(async (config) => {
  const token = await auth().currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
