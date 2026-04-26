import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";

interface CookStepTimerProps {
  initialSeconds: number;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const CookStepTimer = ({ initialSeconds }: CookStepTimerProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setRemainingSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
      ]}
    >
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}> 
          {t("cookTimerLabel")}
        </Text>
        <Text style={[styles.time, { color: colors.text }]}>
          {formatTime(remainingSeconds)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => setIsRunning((current) => !current)}
          style={[
            styles.action,
            { backgroundColor: colors.accent },
          ]}
        >
          <MaterialCommunityIcons
            name={isRunning ? "pause" : "play"}
            size={scale(18)}
            color={colors.textInverse}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            setIsRunning(false);
            setRemainingSeconds(initialSeconds);
          }}
          style={[styles.action, { backgroundColor: colors.surface }]}
        >
          <MaterialCommunityIcons
            name="restart"
            size={scale(18)}
            color={colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: scale(18),
    padding: scale(14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: scale(12),
  },
  label: {
    ...fontStyles.caption,
    textTransform: "uppercase",
  },
  time: {
    ...fontStyles.headline2,
  },
  actions: {
    flexDirection: "row",
    gap: scale(8),
  },
  action: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CookStepTimer;
