import { changeLanguage } from "i18next";
import * as RNLocalize from "react-native-localize";
import { resources } from "../localization/resources";
import { storageService } from "../storage/AsyncStorageService";

const SUPPORTED_LANGUAGES = Object.keys(resources);
const FALLBACK_LANGUAGE = "en";
const STORAGE_KEY = "language" as const;

export const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  const match = locales.find((l) =>
    SUPPORTED_LANGUAGES.includes(l.languageCode),
  );
  return match?.languageCode ?? FALLBACK_LANGUAGE;
};

export const initializeLanguage = async (): Promise<void> => {
  const stored = await storageService.getItem(STORAGE_KEY);
  if (stored?.code) {
    await changeLanguage(stored.code);
    return;
  }
  await changeLanguage(getDeviceLanguage());
};

export const setLanguage = async (code: string): Promise<void> => {
  await storageService.setItem(STORAGE_KEY, { code });
  await changeLanguage(code);
};
