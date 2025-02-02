import { Button, Text } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export function Home() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text>{t("welcome")}</Text>
      <Text>Open up 'src/App.tsx' to start working on your app!</Text>
      <Button screen="Profile">Go to Profile</Button>
      <Button screen="Settings">Go to Settings</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
