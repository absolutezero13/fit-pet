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
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { createGeminiStream } from "../services/gptApi";
import { createChatPrompt } from "../utils/mealPrompt";
import useOnboardingStore from "../zustand/useOnboardingStore";

const TAB_BAR_HEIGHT = scale(85);

type ChatMessage = {
  id: string;
  text: string;
  role: "user" | "model";
  timestamp: Date;
};

const EmptyState = () => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>Start a conversation</Text>
      <Text style={styles.emptyStateDescription}>
        Ask questions about nutrition, diet plans, or meal suggestions
      </Text>
    </View>
  );
};

const ChatMessage = ({ message }: { message: ChatMessage }) => {
  const time = message.timestamp.toLocaleTimeString("en-US", {
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
  const { bottom } = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);
  const textInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener("focus", () => {
      textInputRef.current?.focus();
    });
  }, [navigation, textInputRef]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [userMessage, ...prevMessages]);
    setInputText("");

    console.log({ inputText });

    const geminiResponse = await createGeminiStream(
      inputText,
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
      console.log(
        "gemini says:",
        geminiResponse.response.candidates[0].content.parts[0].text
      );
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: geminiResponse.response.candidates[0].content.parts[0].text,
        role: "model",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [botMessage, ...prevMessages]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Assistant</Text>
      </View>

      {messages.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <ChatMessage message={item} />}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted
        />
      ) : (
        <EmptyState />
      )}

      <View style={[styles.inputContainer, { marginBottom: TAB_BAR_HEIGHT }]}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          ref={textInputRef}
          onSubmitEditing={handleSendMessage}
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
          onPress={handleSendMessage}
          disabled={inputText.trim() === ""}
        >
          <MaterialCommunityIcons name="send" size={scale(20)} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
  },
  title: {
    ...fontStyles.headline1,
  },
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: scale(16),
    paddingTop: scale(24),
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
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
    maxHeight: scale(120),
    ...fontStyles.body1,
  },
  sendButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(12),
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
});

export default ChatScreen;
