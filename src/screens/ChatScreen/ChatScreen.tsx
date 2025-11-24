import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { createGeminiStream } from "../../services/gptApi";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { scale, SCREEN_HEIGHT } from "../../theme/utils";
import useMealsStore from "../../zustand/useMealsStore";
import useKeyboardVisible from "./components/useKeyboardVisible";
import { TAB_BAR_HEIGHT } from "../../navigation/constants";
import ChatMessage, { IChatMessage } from "./components/ChatMessage";
import doctorImage from "./components/doctor.png"; // Adjust the path as necessary
import { Button, Form, Host, Section, TextField } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";
import { LiquidGlassView } from "@callstack/liquid-glass";

// Suggestion data type
type Suggestion = {
  text: string;
  prompt: string;
  data?: {};
};

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>{t("startAConversation")}</Text>
      <Text style={styles.emptyStateDescription}>{t("askQuestion")}</Text>
    </View>
  );
};

const AnimatedLiquidGlassView =
  Animated.createAnimatedComponent(LiquidGlassView);

// Suggestion Bubble Component
const SuggestionBubble = ({
  suggestion,
  onPress,
}: {
  suggestion: Suggestion;
  onPress?: (prompt: string) => void;
}) => {
  return (
    <LiquidGlassView interactive effect="clear" style={styles.suggestionBubble}>
      <Pressable onPress={() => onPress?.(suggestion.prompt)}>
        <Text style={styles.suggestionBubbleText}>{suggestion.text}</Text>
      </Pressable>
    </LiquidGlassView>
  );
};

const ChatScreen = () => {
  const { height } = useReanimatedKeyboardAnimation();
  const isFocused = useIsFocused();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const isKeyboardVisible = useKeyboardVisible();
  const navigation = useNavigation();

  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS: Suggestion[] = [
    {
      text: t("howWasMyLastMeal"),
      prompt: JSON.stringify({
        context: t("howWasMyLastMeal"),
        data: {
          ...useMealsStore.getState().loggedMeals[
            useMealsStore.getState().loggedMeals.length - 1
          ],
          insights: null,
        },
      }),
    },
    {
      text: t("brutallyHonestFeedback"),
      prompt: JSON.stringify({
        context: t("brutallyHonestFeedback"),
      }),
    },
  ];

  useEffect(() => {
    navigation.addListener("focus", () => {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    });
  }, [navigation, textInputRef]);

  const handleSendMessage = async (message?: string, data?: {}) => {
    if (loading) {
      return;
    }
    const textToSend = message || inputText;

    if (textToSend.trim() === "") return;

    // Add user message
    const userMessage: IChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setLoading(true);

    const geminiResponse = await createGeminiStream(
      textToSend + (data ? ` ${JSON.stringify(data)}` : ""),
      [userMessage, ...messages].map((message) => ({
        role: message.role,
        parts: [
          {
            text: message.text,
          },
        ],
      }))
    );
    console.log({ geminiResponse });

    setLoading(false);

    if (geminiResponse.response) {
      const botMessage: IChatMessage = {
        id: (Date.now() + 1).toString(),
        text: geminiResponse.response.candidates[0].content.parts[0].text,
        role: "model",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  const handleSuggestionPress = (prompt: string) => {
    // You can parse the stringified prompt if needed
    const parsedPrompt = JSON.parse(prompt);
    handleSendMessage(parsedPrompt.context, parsedPrompt.data);
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isKeyboardVisible]);

  return (
    <View style={styles.container}>
      <AnimatedLiquidGlassView
        effect="clear"
        tintColor={colors["color-primary-200"]}
        layout={FadeInUp}
        style={[
          styles.header,
          {
            paddingTop: top,
            borderBottomLeftRadius: scale(30),
            borderBottomRightRadius: scale(30),
            paddingBottom: isKeyboardVisible ? scale(8) : scale(24),
          },
        ]}
      >
        <Text
          style={
            isKeyboardVisible
              ? {
                  ...fontStyles.headline2,
                }
              : {
                  ...fontStyles.headline1,
                }
          }
        >
          {t("nutritionAssistant")}
        </Text>
      </AnimatedLiquidGlassView>

      <Image source={doctorImage} style={styles.doctor} />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
        ListFooterComponent={loading ? <ChatMessage loading /> : null}
        style={[
          styles.messageList,
          {
            marginBottom: isKeyboardVisible ? scale(260) : 0,
          },
        ]}
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={EmptyState}
      />
      <View style={[styles.inputContainer]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          {SUGGESTIONS.map((suggestion, index) => (
            <SuggestionBubble
              key={index}
              suggestion={suggestion}
              onPress={loading ? undefined : handleSuggestionPress}
            />
          ))}
        </ScrollView>
        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              marginBottom: isKeyboardVisible ? 0 : TAB_BAR_HEIGHT + scale(12),
              position: isKeyboardVisible ? "absolute" : undefined,
            },
            {
              transform: [
                {
                  translateY: isFocused ? height : 0,
                },
              ],
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder={t("typeYourMessage")}
            value={inputText}
            onChangeText={setInputText}
            ref={textInputRef}
            onSubmitEditing={() => handleSendMessage()}
          />

          <Host style={styles.sendButton}>
            <Button
              color="black"
              variant="glass"
              controlSize="large"
              systemImage="paperplane.fill"
              modifiers={[
                glassEffect({
                  glass: {
                    variant: "clear",
                  },
                }),
              ]}
              onPress={() => handleSendMessage()}
              disabled={false}
            />
          </Host>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    padding: scale(24),
    paddingTop: scale(60),
    paddingBottom: scale(32),
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  title: {},
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
  },
  messageList: {
    flexGrow: 1,
  },
  messageListContent: {
    paddingHorizontal: scale(16),
    flexGrow: 1,
    paddingBottom: scale(48),
    paddingTop: scale(150),
  },
  inputContainer: {
    alignItems: "center",
    paddingBottom: scale(12),
    borderTopWidth: 1,
    borderTopColor: colors["color-primary-100"],
    backgroundColor: colors["color-primary-100"],
  },
  input: {
    borderRadius: scale(20),
    backgroundColor: "white",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginHorizontal: scale(16),
    maxHeight: scale(120),
    ...fontStyles.body1,
    flex: 1,
  },
  sendButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(32),
  },
  emptyStateTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
    textAlign: "center",
  },
  emptyStateDescription: {
    ...fontStyles.body1,
    color: colors["color-primary-400"],
    textAlign: "center",
    marginBottom: scale(32),
  },
  emptyStateButton: {
    backgroundColor: colors["color-success-400"],
    paddingHorizontal: scale(20),
    paddingVertical: scale(14),
    borderRadius: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors["color-success-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 4,
  },
  emptyStateButtonText: {
    ...fontStyles.headline4,
    color: "white",
  },
  // New suggestion bubbles styles
  suggestionsContainer: {
    paddingHorizontal: scale(16),
    backgroundColor: colors["color-primary-100"],
    marginBottom: scale(12),
  },
  suggestionBubble: {
    backgroundColor: "white",
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    marginRight: scale(10),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 2,
  },
  suggestionBubbleText: {
    ...fontStyles.body2,
    color: colors["color-primary-600"],
  },
  doctor: {
    width: scale(250),
    height: scale(250),
    position: "absolute",
    opacity: 0.1,
    top: SCREEN_HEIGHT / 2 - scale(250) / 2,
    alignSelf: "center",
  },
});

export default ChatScreen;
