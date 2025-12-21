import { Text, View, StyleSheet, ScrollView, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";
import { Picker } from "@react-native-picker/picker";

const ageData = Array.from({ length: 70 }, (_, i) => i + 15);
const AGE_ITEM_SIZE = scale(70);
const ITEM_HEIGHT = scale(70);

const Age = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(9);
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedIndex(index);
    useOnboardingStore.setState({
      yearOfBirth: new Date().getFullYear() - ageData[index],
    });
  };

  const handleMomentumScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  useEffect(() => {
    // Initialize scroll position
    scrollViewRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  const getItemOpacity = (index) => {
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.6;
    if (distance === 2) return 0.3;
    return 0.15;
  };

  const renderIOSPicker = () => {
    return (
      <Picker
        selectedValue={ageData[selectedIndex]}
        mode="dialog"
        onValueChange={(itemValue, itemIndex) => {
          setSelectedIndex(itemIndex);
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

  const renderAndroidPicker = () => {
    return (
      <View style={styles.androidPickerContainer}>
        {/* Selection indicator */}
        <View style={styles.selectionIndicator} pointerEvents="none" />

        {/* Scrollable wheel */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />

          {ageData.map((age, index) => (
            <View
              key={age}
              style={[
                styles.ageItem,
                {
                  opacity: getItemOpacity(index),
                },
              ]}
            >
              <Text style={[fontStyles.headline2, styles.itemText]}>{age}</Text>
            </View>
          ))}

          {/* Bottom padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>

        {/* Top fade overlay */}
        <View
          style={[styles.overlay, styles.topOverlay]}
          pointerEvents="none"
        />

        {/* Bottom fade overlay */}
        <View
          style={[styles.overlay, styles.bottomOverlay]}
          pointerEvents="none"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {Platform.OS === "ios" ? renderIOSPicker() : renderAndroidPicker()}
      </View>

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
  androidPickerContainer: {
    height: ITEM_HEIGHT * 5,
    position: "relative",
    marginHorizontal: scale(24),
    borderRadius: scale(16),
    overflow: "hidden",
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
  selectedItemText: {},
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
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
  },
  topOverlay: {
    top: 0,
  },
  bottomOverlay: {
    bottom: 0,
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
