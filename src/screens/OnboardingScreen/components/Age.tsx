import { NativeScrollEvent, Text, View, StyleSheet } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRef } from "react";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale, shadowStyle } from "../../../theme/utils";
import useOnboardingStore from "../../../zustand/useOnboardingStore";

const ageData = Array.from({ length: 50 }, (_, i) => i + 15);
const AGE_ITEM_SIZE = scale(70);

const Age = () => {
  const ageRef = useRef<number>(0);
  const scrollRef = useRef<FlatList>(null);
  const { t } = useTranslation();

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

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <FlatList
          initialScrollIndex={9}
          onScroll={onScroll}
          ref={scrollRef}
          onMomentumScrollEnd={() =>
            useOnboardingStore.setState({ age: ageRef.current })
          }
          snapToInterval={AGE_ITEM_SIZE}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          data={ageData}
          keyExtractor={(item) => item.toString()}
          getItemLayout={(_, index) => ({
            length: AGE_ITEM_SIZE,
            offset: AGE_ITEM_SIZE * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                useOnboardingStore.setState({ age: item });
                scrollRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
              }}
              key={item}
              style={styles.ageItem}
            >
              <Text style={fontStyles.headline1}>{item}</Text>
            </Pressable>
          )}
        />

        <View style={styles.selectionIndicatorContainer}>
          <View style={styles.selectionIndicator}>
            <AntDesign
              name="caretup"
              size={24}
              color={colors["color-success-700"]}
            />
          </View>
        </View>
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
