import { NativeScrollEvent, Text, View, StyleSheet } from "react-native";
import { useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";

const ageData = Array.from({ length: 50 }, (_, i) => i + 15);
const AGE_ITEM_SIZE = scale(70);

const Age = () => {
  const ageRef = useRef<number>(0);
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(9);

  const onScroll = (e: { nativeEvent: NativeScrollEvent }) => {
    const index = Math.floor(
      e.nativeEvent.contentOffset.y / (AGE_ITEM_SIZE - 1)
    );

    if (
      ageRef.current !==
      ageData[index > ageData.length - 1 ? ageData.length - 1 : index]
    ) {
      ageRef.current =
        ageData[index > ageData.length - 1 ? ageData.length - 1 : index];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderPicker = () => {
    return (
      <Picker
        selectedValue={ageData[selectedIndex]}
        onValueChange={(itemValue, itemIndex) => {
          setSelectedIndex(itemIndex);
          console.log("itemValue", itemValue);
          useOnboardingStore.setState({
            yearOfBirth: new Date().getFullYear() - itemValue,
          });
        }}
        style={{ width: scale(300), height: 400, alignSelf: "center" }}
        itemStyle={{ height: scale(350), ...fontStyles.headline2 }}
      >
        {ageData.map((age) => (
          <Picker.Item key={age} label={age.toString()} value={age} />
        ))}
      </Picker>
    );
  };

  console.log("yearOfBirth", useOnboardingStore.getState().yearOfBirth);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>{renderPicker()}</View>

      <View style={styles.infoCard}>
        <Text style={[fontStyles.headline3, styles.infoCardTitle]}>
          {t("whyWeAsk")}
        </Text>
        <Text style={[fontStyles.body2, styles.infoCardDescription]}>
          {t("whyWeAskDescription")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerContainer: {
    justifyContent: "center",
  },
  flatList: {
    borderRadius: scale(16),
    height: 4 * AGE_ITEM_SIZE,
  },
  flatListContent: {
    paddingHorizontal: scale(24),
    paddingBottom: 2 * AGE_ITEM_SIZE,
    alignItems: "center",
    paddingTop: scale(72),
  },
  ageItem: {
    height: AGE_ITEM_SIZE,
    width: AGE_ITEM_SIZE,
    borderRadius: AGE_ITEM_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionIndicatorContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH - scale(48),
    marginHorizontal: scale(24),
    position: "absolute",
    top: scale(72),
    zIndex: -1,
  },
  selectionIndicator: {
    borderWidth: 1,
    borderColor: colors["color-success-700"],
    borderRadius: scale(99),
    width: AGE_ITEM_SIZE + scale(10),
    height: AGE_ITEM_SIZE + scale(10),
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: colors["color-primary-100"],
  },
  infoCard: {
    position: "absolute",
    bottom: scale(96),
    borderWidth: 1,
    marginHorizontal: scale(24),
    borderRadius: scale(16),
    padding: scale(12),
    backgroundColor: colors["color-primary-500"],
    ...shadowStyle,
  },
  infoCardTitle: {
    color: colors["color-primary-100"],
  },
  infoCardDescription: {
    marginTop: scale(8),
    color: colors["color-primary-100"],
  },
});

export default Age;
