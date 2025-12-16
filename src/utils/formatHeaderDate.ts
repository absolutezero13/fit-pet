import i18next from "i18next";

const formatHeaderDate = (date: Date): string => {
  const dateLangMapping: Record<string, string> = {
    tr: "tr-TR",
    en: "en-US",
  };

  const currentLang = i18next.language;
  const locale = dateLangMapping[currentLang] || "en-US";

  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export default formatHeaderDate;
