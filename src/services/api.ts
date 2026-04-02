import axios from "axios";
import { getAuth } from "@react-native-firebase/auth";
import { Platform } from "react-native";

export const LIVE_ENDPOINT = "https://fit-pet-be.vercel.app/api";

const DEV_ENDPOINT = Platform.select({
  ios: "http://localhost:3000/api",
});

export const ENDPOINT = DEV_ENDPOINT;

const api = axios.create({
  baseURL: ENDPOINT,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuth().currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
