import React, { FC, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TrueSheet } from "../../../components/TrueSheet";
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { TrueSheetNames } from "../../../navigation/constants";
import AppButton from "../../../components/AppButton";
import userService from "../../../services/user";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { scale } from "../../../theme/utils";
import useUserStore from "../../../zustand/useUserStore";

const ITEM_HEIGHT = scale(50);

const heightData = Array.from({ length: 120 }, (_, i) => i + 130);
const weightData = Array.from({ length: 160 }, (_, i) => i + 40);

const WeightHeightPicker: FC = () => {
  const { t } = useTranslation();
  const { colors: themeColors, isDark } = useTheme();
  const user = useUserStore();
  const currentHeight = user?.onboarding?.height ?? 170;
  const currentWeight = user?.onboarding?.weight ?? 70;
  const currentGoals = user?.onboarding?.goals || [];

  const [draftHeight, setDraftHeight] = useState(currentHeight);
  const [draftWeight, setDraftWeight] = useState(currentWeight);
  const [saving, setSaving] = useState(false);
  const heightScrollRef = useRef<ScrollView>(null);
  const weightScrollRef = useRef<ScrollView>(null);

  const syncScrollPositions = (nextHeight: number, nextWeight: number) => {
    const nextHeightIndex = Math.max(0, heightData.indexOf(nextHeight));
    const nextWeightIndex = Math.max(0, weightData.indexOf(nextWeight));

    setTimeout(() => {
      heightScrollRef.current?.scrollTo({
        y: nextHeightIndex * ITEM_HEIGHT,
        animated: false,
      });
      weightScrollRef.current?.scrollTo({
        y: nextWeightIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  };

  useEffect(() => {
    syncScrollPositions(currentHeight, currentWeight);
  }, []);

  const heightIndex = Math.max(0, heightData.indexOf(draftHeight ?? 170));
  const weightIndex = Math.max(0, weightData.indexOf(draftWeight ?? 70));

  const handleWillPresent = () => {
    setDraftHeight(currentHeight);
    setDraftWeight(currentWeight);
    syncScrollPositions(currentHeight, currentWeight);
  };

  const handleHeightScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newHeight =
      heightData[Math.max(0, Math.min(index, heightData.length - 1))];

    if (newHeight !== draftHeight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDraftHeight(newHeight);
    }
  };

  const handleWeightScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newWeight =
      weightData[Math.max(0, Math.min(index, weightData.length - 1))];

    if (newWeight !== draftWeight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDraftWeight(newWeight);
    }
  };

  const handleMomentumEnd = (
    ref: React.RefObject<ScrollView | null>,
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
  };

  const getItemOpacity = (index: number, selectedIndex: number) => {
    const distance = Math.abs(index - selectedIndex);

    if (distance === 0) return 1;
    if (distance === 1) return 0.5;
    if (distance === 2) return 0.25;

    return 0.1;
  };

  const renderIOSPicker = (
    data: number[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    unit: string,
  ) => (
    <View style={styles.iosPickerWrapper}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.iosPicker}
        itemStyle={[styles.iosPickerItem, { color: themeColors.text }]}
      >
        {data.map((value) => (
          <Picker.Item key={value} label={`${value}`} value={value} />
        ))}
      </Picker>
      <Text style={styles.iosUnit}>{unit}</Text>
    </View>
  );

  const renderAndroidPicker = (
    data: number[],
    scrollRef: React.RefObject<ScrollView | null>,
    selectedIndex: number,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    unit: string,
  ) => (
    <View style={styles.androidPickerWrapper}>
      <View style={styles.selectionIndicator} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={(event) => handleMomentumEnd(scrollRef, event)}
        scrollEventThrottle={16}
      >
        <View style={{ height: ITEM_HEIGHT * 2 }} />
        {data.map((value, index) => (
          <View
            key={value}
            style={[
              styles.pickerItem,
              { opacity: getItemOpacity(index, selectedIndex) },
            ]}
          >
            <Text style={styles.pickerItemText}>{value}</Text>
          </View>
        ))}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>
      <View style={styles.topOverlay} pointerEvents="none" />
      <View style={styles.bottomOverlay} pointerEvents="none" />
      <View style={styles.unitBadge}>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.createOrUpdateUser({
        onboarding: {
          goals: currentGoals,
          height: draftHeight,
          weight: draftWeight,
        },
      });
      await TrueSheet.dismiss(TrueSheetNames.WEIGHT_HEIGHT_PICKER);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TrueSheet
      name={TrueSheetNames.WEIGHT_HEIGHT_PICKER}
      detents={["auto"]}
      blurTint={
        isDark ? "system-thick-material-dark" : "system-thick-material-light"
      }
      insetAdjustment="never"
      onWillPresent={handleWillPresent}
      blurOptions={{
        interaction: false,
      }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {t("profile")}
        </Text>

        <View style={styles.pickersRow}>
          <View style={styles.pickerCard}>
            <Text style={[styles.pickerLabel, { color: themeColors.text }]}>
              {t("height")}
            </Text>
            {Platform.OS === "ios"
              ? renderIOSPicker(heightData, draftHeight, setDraftHeight, "cm")
              : renderAndroidPicker(
                  heightData,
                  heightScrollRef,
                  heightIndex,
                  handleHeightScroll,
                  "cm",
                )}
          </View>

          <View style={styles.pickerCard}>
            <Text style={[styles.pickerLabel, { color: themeColors.text }]}>
              {t("weight")}
            </Text>
            {Platform.OS === "ios"
              ? renderIOSPicker(weightData, draftWeight, setDraftWeight, "kg")
              : renderAndroidPicker(
                  weightData,
                  weightScrollRef,
                  weightIndex,
                  handleWeightScroll,
                  "kg",
                )}
          </View>
        </View>

        <AppButton
          title={t("save")}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          margin={{ marginTop: scale(20), marginHorizontal: scale(24) }}
        />
      </View>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: scale(24),
    paddingBottom: scale(32),
    paddingHorizontal: scale(24),
  },
  title: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
    textAlign: "center",
  },
  pickersRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  pickerCard: {
    flex: 1,
    borderRadius: scale(20),
    padding: scale(16),
  },
  pickerLabel: {
    ...fontStyles.body2,
    fontWeight: "600",
    color: colors["color-primary-50"],
    textAlign: "center",
    marginBottom: scale(8),
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  iosPickerWrapper: {
    position: "relative",
  },
  iosPicker: {
    height: scale(180),
  },
  iosPickerItem: {
    ...fontStyles.headline2,
    height: scale(180),
  },
  iosUnit: {
    position: "absolute",
    right: scale(24),
    top: "50%",
    marginTop: -scale(10),
    ...fontStyles.body1,
    fontWeight: "600",
    color: "#AAAAAA",
  },
  androidPickerWrapper: {
    height: ITEM_HEIGHT * 5,
    position: "relative",
    borderRadius: scale(12),
    overflow: "hidden",
    backgroundColor: colors["color-primary-50"],
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: scale(8),
    right: scale(8),
    height: ITEM_HEIGHT,
    backgroundColor: colors["color-primary-50"],
    borderRadius: scale(10),
    zIndex: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    ...fontStyles.headline3,
    color: colors["color-primary-700"],
    fontWeight: "700",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: "transparent",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: "transparent",
  },
  unitBadge: {
    position: "absolute",
    right: scale(12),
    top: "50%",
    marginTop: -scale(12),
    backgroundColor: "#E8E8E8",
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  unitText: {
    ...fontStyles.caption,
    fontWeight: "700",
    color: "#888888",
  },
});

export default WeightHeightPicker;
