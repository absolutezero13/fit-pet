import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  StyleSheet,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRef, useEffect } from "react";
import maleStandingPerson from "../../assets/male-person-standing.png";
import nonbinaryStandingPerson from "../../assets/nonbinary-person-standing.png";
import femaleStandingPerson from "../../assets/female-person-standing.png";
import * as Haptics from "expo-haptics";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { IS_SMALL_SCREEN, scale } from "../../../theme/utils";
import useOnboardingStore, {
  GenderEnum,
} from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeContext";

const imageMapping: Record<GenderEnum, ImageSourcePropType> = {
  [GenderEnum.Female]: femaleStandingPerson,
  [GenderEnum.Male]: maleStandingPerson,
  [GenderEnum.Other]: nonbinaryStandingPerson,
};

const BASE_IMAGE_HEIGHT = IS_SMALL_SCREEN ? scale(180) : scale(240);
const BASE_IMAGE_WIDTH = scale(100);
const ITEM_HEIGHT = scale(50);

const heightData = Array.from({ length: 120 }, (_, i) => i + 130);
const weightData = Array.from({ length: 160 }, (_, i) => i + 40);

const getWeightScale = (weight: number | null) => {
  if (!weight) return 1;
  const normalized = (weight - 40) / (200 - 80);
  return 0.85 + normalized * 0.3;
};

const WeightHeight = () => {
  const { t } = useTranslation();
  const { height, weight, gender } = useOnboardingStore();
  const { colors } = useTheme();
  const heightScrollRef = useRef<ScrollView>(null);
  const weightScrollRef = useRef<ScrollView>(null);

  const heightIndex = heightData.indexOf(height ?? 170);
  const weightIndex = weightData.indexOf(weight ?? 70);

  useEffect(() => {
    // Initialize scroll positions
    setTimeout(() => {
      heightScrollRef.current?.scrollTo({
        y: heightIndex * ITEM_HEIGHT,
        animated: false,
      });
      weightScrollRef.current?.scrollTo({
        y: weightIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  const handleHeightScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newHeight =
      heightData[Math.max(0, Math.min(index, heightData.length - 1))];
    if (newHeight !== height) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useOnboardingStore.setState({ height: newHeight });
    }
  };

  const handleWeightScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newWeight =
      weightData[Math.max(0, Math.min(index, weightData.length - 1))];
    if (newWeight !== weight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useOnboardingStore.setState({ weight: newWeight });
    }
  };

  const handleMomentumEnd = (
    ref: React.RefObject<ScrollView>,
    event: NativeSyntheticEvent<NativeScrollEvent>
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

  const imageWidth = BASE_IMAGE_WIDTH * getWeightScale(weight ?? null);

  const renderIOSPicker = (
    data: number[],
    selectedValue: number | null,
    onValueChange: (value: number) => void,
    unit: string
  ) => (
    <View style={styles.iosPickerWrapper}>
      <Picker
        selectedValue={selectedValue ?? data[0]}
        onValueChange={onValueChange}
        style={styles.iosPicker}
        itemStyle={[styles.iosPickerItem, { color: colors.text }]}
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
    scrollRef: React.RefObject<ScrollView>,
    selectedIndex: number,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    unit: string
  ) => (
    <View style={styles.androidPickerWrapper}>
      <View style={styles.selectionIndicator} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={(e) => handleMomentumEnd(scrollRef, e)}
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

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={imageMapping[gender || GenderEnum.Female]}
          resizeMode="contain"
          style={{ width: imageWidth, height: BASE_IMAGE_HEIGHT }}
        />
      </View>

      <View style={styles.pickersRow}>
        <View style={styles.pickerCard}>
          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            {t("height")}
          </Text>
          {Platform.OS === "ios"
            ? renderIOSPicker(
                heightData,
                height,
                (v) => useOnboardingStore.setState({ height: v }),
                "cm"
              )
            : renderAndroidPicker(
                heightData,
                heightScrollRef,
                heightIndex,
                handleHeightScroll,
                "cm"
              )}
        </View>

        {/* Weight Picker */}
        <View style={styles.pickerCard}>
          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            {t("weight")}
          </Text>
          {Platform.OS === "ios"
            ? renderIOSPicker(
                weightData,
                weight,
                (v) => useOnboardingStore.setState({ weight: v }),
                "kg"
              )
            : renderAndroidPicker(
                weightData,
                weightScrollRef,
                weightIndex,
                handleWeightScroll,
                "kg"
              )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(16),
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

export default WeightHeight;
