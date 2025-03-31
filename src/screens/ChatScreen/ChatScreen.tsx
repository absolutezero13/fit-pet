import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { createGeminiStream } from "../../services/gptApi";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { scale } from "../../theme/utils";
import useMealsStore from "../../zustand/useMealsStore";
import useKeyboardVisible from "./components/useKeyboardVisible";
import { TAB_BAR_HEIGHT } from "../../navigation/constants";

// Suggestion data type
type Suggestion = {
  text: string;
  prompt: string;
  data?: {};
};

// Suggestion data array

type ChatMessage = {
  id: string;
  text: string;
  role: "user" | "model";
  timestamp: Date;
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

// Suggestion Bubble Component
const SuggestionBubble = ({
  suggestion,
  onPress,
}: {
  suggestion: Suggestion;
  onPress: (prompt: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.suggestionBubble}
      onPress={() => onPress(suggestion.prompt)}
    >
      <Text style={styles.suggestionBubbleText}>{suggestion.text}</Text>
    </TouchableOpacity>
  );
};

const ChatMessage = ({ message }: { message: ChatMessage }) => {
  const time = message.timestamp.toLocaleTimeString("tr-TR", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      <View style={styles.messageContent}>
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {message.text}
        </Text>
      </View>
      <Text
        style={[
          styles.messageTime,
          isUser ? styles.userMessageTime : styles.botMessageTime,
        ]}
      >
        {time}
      </Text>
    </View>
  );
};

const ChatScreen = () => {
  const { height } = useReanimatedKeyboardAnimation();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);
  const textInputRef = useRef<TextInput>(null);

  const isKeyboardVisible = useKeyboardVisible();
  const navigation = useNavigation();
  console.log({ isKeyboardVisible });
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
    // {
    //   text: "Nutrition advice",
    //   prompt: JSON.stringify({
    //     context: "General nutritional guidance and recommendations",
    //   }),
    // },
    // {
    //   text: "Calorie tracking",
    //   prompt: JSON.stringify({
    //     mealType: "tracking",
    //     context: "Help with calorie counting and dietary goals",
    //   }),
    // },
  ];

  useEffect(() => {
    navigation.addListener("focus", () => {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    });
  }, [navigation, textInputRef]);

  const handleSendMessage = async (message?: string, data?: {}) => {
    const textToSend = message || inputText;

    if (textToSend.trim() === "") return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [userMessage, ...prevMessages]);
    setInputText("");

    console.log({ textToSend });

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

    if (geminiResponse.response) {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: geminiResponse.response.candidates[0].content.parts[0].text,
        role: "model",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [botMessage, ...prevMessages]);
    }
  };

  const handleSuggestionPress = (prompt: string) => {
    // You can parse the stringified prompt if needed
    const parsedPrompt = JSON.parse(prompt);
    handleSendMessage(parsedPrompt.context, parsedPrompt.data);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        layout={FadeInUp}
        style={[
          styles.header,
          {
            paddingTop: isKeyboardVisible ? top : scale(60),
            borderBottomLeftRadius: isKeyboardVisible ? 0 : scale(30),
            borderBottomRightRadius: isKeyboardVisible ? 0 : scale(30),
            paddingBottom: isKeyboardVisible ? scale(8) : scale(32),
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
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        inverted
        keyExtractor={(item) => item.id}
        style={[
          styles.messageList,
          {
            marginBottom: isKeyboardVisible ? scale(260) : 0,
          },
        ]}
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={() => <EmptyState />}
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
              onPress={handleSuggestionPress}
            />
          ))}
        </ScrollView>
        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              paddingVertical: scale(12),
              marginBottom: isKeyboardVisible ? 0 : TAB_BAR_HEIGHT + bottom,
              position: isKeyboardVisible ? "absolute" : undefined,
            },
            {
              transform: [
                {
                  translateY: height,
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
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() === ""
                    ? colors["color-primary-300"]
                    : colors["color-success-400"],
              },
            ]}
            onPress={() => handleSendMessage()}
            disabled={inputText.trim() === ""}
          >
            <MaterialCommunityIcons
              name="send"
              size={scale(20)}
              color="white"
            />
          </TouchableOpacity>
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
    backgroundColor: colors["color-primary-200"],

    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
  },
  title: {},
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
  },
  messageList: {
    flexGrow: 1,
    // backgroundColor: "red",
  },
  messageListContent: {
    padding: scale(16),
    paddingTop: scale(24),
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: scale(16),
    borderRadius: scale(16),
    padding: scale(12),
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 2,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: colors["color-success-400"],
    shadowColor: colors["color-success-500"],
  },
  botMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    shadowColor: colors["color-primary-500"],
  },
  messageContent: {},
  messageText: {
    ...fontStyles.body1,
  },
  userMessageText: {
    color: "white",
  },
  botMessageText: {
    color: colors["color-primary-800"],
  },
  messageTime: {
    ...fontStyles.caption,
    alignSelf: "flex-end",
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  botMessageTime: {
    color: colors["color-primary-400"],
  },
  inputContainer: {
    alignItems: "center",
    paddingVertical: scale(12),
    borderTopWidth: 1,
    borderTopColor: colors["color-primary-100"],
    backgroundColor: colors["color-primary-100"],
  },
  input: {
    flex: 1,
    borderRadius: scale(20),
    backgroundColor: "white",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginHorizontal: scale(16),
    maxHeight: scale(120),
    ...fontStyles.body1,
  },
  sendButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 3,
  },
  // Empty state styles
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
    height: scale(40),
  },
  suggestionBubbleText: {
    ...fontStyles.body2,
    color: colors["color-primary-600"],
  },
});

export default ChatScreen;
