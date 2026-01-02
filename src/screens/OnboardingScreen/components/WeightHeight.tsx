import {
  useEffect,
  useMemo,
  useRef,
  useState,
  RefObject,
} from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";

const heightData = Array.from({ length: 120 })
  .fill(0)
  .map((_, i) => i + 130);

const weightData = Array.from({ length: 160 })
  .fill(0)
  .map((_, i) => i + 40);

const BMI_UNDERWEIGHT_MAX = 18.5;
const BMI_HEALTHY_MAX = 25;
const BMI_OVERWEIGHT_MAX = 30;
const ITEM_HEIGHT = scale(70);

const WeightHeight = () => {
  const { height, weight } = useOnboardingStore();
  const [heightIndex, setHeightIndex] = useState(
    height ? height - heightData[0] : 0
  );
  const [weightIndex, setWeightIndex] = useState(
    weight ? weight - weightData[0] : 0
  );
  const heightScrollRef = useRef<ScrollView>(null);
  const weightScrollRef = useRef<ScrollView>(null);

  const onHeightValueChange = (itemValue: number) => {
    if (itemValue !== height) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useOnboardingStore.setState({ height: itemValue });
    }
  };

  const onWeightValueChange = (itemValue: number) => {
    if (itemValue !== weight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useOnboardingStore.setState({ weight: itemValue });
    }
  };

  const bmi = useMemo(
    () =>
      height && weight
        ? Number((weight / Math.pow(height / 100, 2)).toFixed(1))
        : null,
    [height, weight]
  );

  const bmiCategory = useMemo(() => {
    if (bmi === null) return "";
    if (bmi < BMI_UNDERWEIGHT_MAX) return "Underweight";
    if (bmi < BMI_HEALTHY_MAX) return "Healthy";
    if (bmi < BMI_OVERWEIGHT_MAX) return "Overweight";
    return "Obese";
  }, [bmi]);

  const pickerMode = Platform.OS === "android" ? "dropdown" : undefined;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    heightScrollRef.current?.scrollTo({
      y: heightIndex * ITEM_HEIGHT,
      animated: false,
    });
    weightScrollRef.current?.scrollTo({
      y: weightIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    data: number[],
    setIndex: (value: number) => void,
    setterKey: "height" | "weight"
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.min(Math.max(index, 0), data.length - 1);
    setIndex(clampedIndex);
    const value = data[clampedIndex];
    if (setterKey === "height" && value !== height) {
      useOnboardingStore.setState({ height: value });
    }
    if (setterKey === "weight" && value !== weight) {
      useOnboardingStore.setState({ weight: value });
    }
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    scrollRef: RefObject<ScrollView>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const renderPicker = (
    label: string,
    data: number[],
    selected: number | null,
    onChange: (value: number) => void,
    unit: string
  ) => {
    if (Platform.OS === "android") {
      const selectedIndex =
        label === "Height" ? heightIndex : weightIndex;
      const scrollRef =
        label === "Height" ? heightScrollRef : weightScrollRef;
      const setIndex = label === "Height" ? setHeightIndex : setWeightIndex;
      const setterKey = label === "Height" ? "height" : "weight";

      return (
        <View style={styles.pickerCard}>
          <Text style={styles.cardLabel}>{label}</Text>
          <View style={styles.androidPickerContainer}>
            <View style={styles.selectionIndicator} pointerEvents="none" />
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={(e) =>
                handleScroll(e, data, setIndex, setterKey as "height" | "weight")
              }
              onMomentumScrollEnd={(e) =>
                handleMomentumScrollEnd(e, scrollRef)
              }
              scrollEventThrottle={16}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={{ height: ITEM_HEIGHT * 2 }} />
              {data.map((value, index) => (
                <View
                  key={value}
                  style={[
                    styles.ageItem,
                    {
                      opacity: 1 - Math.min(Math.abs(index - selectedIndex), 3) * 0.25,
                    },
                  ]}
                >
                  <Text style={[fontStyles.headline2, styles.itemText]}>
                    {value}
                  </Text>
                </View>
              ))}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>
            <View
              style={[styles.overlay, styles.topOverlay]}
              pointerEvents="none"
            />
            <View
              style={[styles.overlay, styles.bottomOverlay]}
              pointerEvents="none"
            />
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>{unit}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.pickerCard}>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selected ?? undefined}
            onValueChange={onChange}
            style={styles.picker}
            enabled={true}
            mode={pickerMode}
            selectionColor={colors["color-primary-500"]}
            dropdownIconColor={colors["color-primary-500"]}
            itemStyle={styles.pickerItem}
          >
            {data.map((value) => (
              <Picker.Item
                key={value.toString()}
                label={value.toString()}
                value={value}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
          <View style={styles.unitContainer}>
            <Text style={styles.unitLabel}>{unit}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickersContainer}>
        {renderPicker("Height", heightData, height, onHeightValueChange, "cm")}
        {renderPicker("Weight", weightData, weight, onWeightValueChange, "kg")}
      </View>

      {bmi !== null && (
        <View style={styles.bmiCard}>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={styles.bmiValue}>{bmi}</Text>
          <Text style={styles.bmiCategory}>{bmiCategory}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: "center",
    paddingBottom: scale(140),
  },
  pickersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(16),
    marginTop: scale(32),
  },
  pickerCard: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(16),
    padding: scale(16),
    ...shadowStyle,
  },
  cardLabel: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
    marginBottom: scale(12),
    textAlign: "center",
  },
  pickerWrapper: {
    position: "relative",
    borderRadius: scale(12),
    overflow: "hidden",
    minHeight: scale(120),
    justifyContent: "center",
    backgroundColor: colors["color-primary-50"],
  },
  androidPickerContainer: {
    height: ITEM_HEIGHT * 5,
    position: "relative",
    borderRadius: scale(12),
    overflow: "hidden",
    backgroundColor: colors["color-primary-50"],
  },
  selectedValue: {
    position: "absolute",
    left: scale(16),
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    zIndex: 1,
    pointerEvents: "none",
  },
  picker: {
    width: "100%",
    height: scale(220),
    color: colors["color-primary-500"],
  },
  pickerItem: {
    color: colors["color-primary-500"],
    fontSize: scale(20),
    fontFamily: "Nunito_700Bold",
  },
  unitContainer: {
    position: "absolute",
    right: scale(Platform.OS === "android" ? 12 : 16),
    top: scale(Platform.OS === "android" ? 6 : 3),
    bottom: scale(8),
    justifyContent: "flex-start",
    pointerEvents: "none",
  },
  unitLabel: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
  scrollContent: {
    paddingVertical: 0,
  },
  ageItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    color: colors["color-primary-700"],
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderWidth: 1,
    zIndex: 1,
    borderRadius: scale(8),
    borderColor: colors["color-primary-400"],
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
    backgroundColor: colors["color-primary-100"],
    opacity: 0.45,
  },
  topOverlay: {
    top: 0,
  },
  bottomOverlay: {
    bottom: 0,
  },
  bmiCard: {
    marginTop: scale(32),
    marginBottom: scale(12),
    backgroundColor: colors["color-primary-500"],
    borderRadius: scale(16),
    paddingVertical: scale(16),
    paddingHorizontal: scale(20),
    ...shadowStyle,
  },
  bmiLabel: {
    ...fontStyles.headline4,
    color: colors["color-primary-100"],
    textAlign: "center",
  },
  bmiValue: {
    ...fontStyles.headline1,
    color: colors["color-primary-50"],
    textAlign: "center",
    marginTop: scale(8),
  },
  bmiCategory: {
    ...fontStyles.body1,
    color: colors["color-primary-100"],
    textAlign: "center",
    marginTop: scale(6),
  },
});

export default WeightHeight;
