import { Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { scale, SCREEN_WIDTH, shadowStyle } from "../../theme/utils";
import { FlatList, Pressable, ScrollView } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";
import { fontStyles } from "../../theme/fontStyles";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { useRef } from "react";

const ageData = Array.from({ length: 50 }, (_, i) => i + 15);
console.log("ageData", ageData);
const AGE_ITEM_SIZE = scale(70);

const GAP = scale(0);
const Age = () => {
  const ageRef = useRef(null);
  const scrollRef = useRef<FlatList>(null);
  console.log("useOnboardingStore", useOnboardingStore.getState().age);
  console.log({ AGE_ITEM_SIZE });

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: "center",
        }}
      >
        <FlatList
          initialScrollIndex={9}
          onScroll={(e) => {
            console.log(e.nativeEvent.contentOffset);
            const index = Math.ceil(
              e.nativeEvent.contentOffset.x / (AGE_ITEM_SIZE + GAP)
            );
            //   console.log(index);
            ageRef.current = ageData[index];
          }}
          ref={scrollRef}
          horizontal
          onMomentumScrollEnd={() =>
            useOnboardingStore.setState({ age: ageRef.current })
          }
          snapToInterval={AGE_ITEM_SIZE + GAP}
          showsHorizontalScrollIndicator={false}
          style={{
            borderRadius: scale(16),
            marginTop: scale(72),
          }}
          contentContainerStyle={{
            justifyContent: "space-between",
            paddingHorizontal: scale(24),
            paddingBottom: scale(24),
            flexDirection: "row",
            gap: GAP,
            paddingLeft: (SCREEN_WIDTH - AGE_ITEM_SIZE) / 2,
            paddingRight: (SCREEN_WIDTH - AGE_ITEM_SIZE) / 2,
          }}
          data={ageData}
          keyExtractor={(item) => item.toString()}
          getItemLayout={(data, index) => ({
            length: AGE_ITEM_SIZE,
            offset: (AGE_ITEM_SIZE + GAP) * index,
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
              style={{
                height: AGE_ITEM_SIZE,
                width: AGE_ITEM_SIZE,
                borderRadius: AGE_ITEM_SIZE / 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={[fontStyles.headline1]}>{item}</Text>
            </Pressable>
          )}
        />

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: SCREEN_WIDTH - scale(48),
            marginHorizontal: scale(24),
            position: "absolute",
            bottom: scale(16),
            zIndex: -1,
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: colors["color-success-700"],
              borderRadius: scale(99),
              width: AGE_ITEM_SIZE + scale(10),
              height: AGE_ITEM_SIZE + scale(10),
              justifyContent: "flex-end",
              alignItems: "center",
              backgroundColor: colors["color-primary-100"],
            }}
          >
            <AntDesign
              name="caretup"
              size={24}
              color={colors["color-success-700"]}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: scale(96),
          borderWidth: 1,
          marginHorizontal: scale(24),
          borderRadius: scale(16),
          padding: scale(12),
          backgroundColor: colors["color-primary-500"],
          ...shadowStyle,
        }}
      >
        <Text
          style={[
            fontStyles.headline3,
            {
              color: colors["color-primary-100"],
            },
          ]}
        >
          Why We Ask for Your Age?
        </Text>
        <Text
          style={[
            fontStyles.body2,
            {
              marginTop: scale(8),
              color: colors["color-primary-100"],
            },
          ]}
        >
          Age helps us calculate your daily calorie and macro needs more
          accurately, ensuring personalized nutrition recommendations that fit
          your metabolism and goals.
        </Text>
      </View>
    </View>
  );
};

export default Age;
