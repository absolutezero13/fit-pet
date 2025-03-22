import React, { useState, useRef } from "react";
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

const TAB_BAR_HEIGHT = scale(85);

// Mock data for chat messages
const initialMessages = [
  {
    id: "1",
    text: "Hi there! I'm your nutrition assistant. How can I help you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    text: "I'm trying to find healthy lunch options that are high in protein.",
    isUser: true,
    timestamp: new Date(Date.now() - 3540000),
  },
  {
    id: "3",
    text: "Great choice! For high-protein lunches, I recommend grilled chicken salad with mixed veggies, quinoa bowl with beans and tofu, or a turkey and avocado wrap with whole grain bread. Would you like specific recipes for any of these?",
    isUser: false,
    timestamp: new Date(Date.now() - 3500000),
  },
];

const EmptyState = ({ onPress }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>Start a conversation</Text>
      <Text style={styles.emptyStateDescription}>
        Ask questions about nutrition, diet plans, or meal suggestions
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={onPress}>
        <Text style={styles.emptyStateButtonText}>Send First Message</Text>
        <MaterialCommunityIcons
          name="arrow-right-circle-outline"
          size={scale(18)}
          color="white"
          style={{ marginLeft: scale(8) }}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChatMessage = ({ message }) => {
  const time = message.timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <View
      style={[
        styles.messageContainer,
        message.isUser
          ? styles.userMessageContainer
          : styles.botMessageContainer,
      ]}
    >
      <View style={styles.messageContent}>
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {message.text}
        </Text>
      </View>
      <Text
        style={[
          styles.messageTime,
          message.isUser ? styles.userMessageTime : styles.botMessageTime,
        ]}
      >
        {time}
      </Text>
    </View>
  );
};

const ChatScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  const navigation = useNavigation();

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    // Simulate bot response (in a real app, you would call your API here)
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: "I understand your question. Let me provide some helpful nutrition advice based on your needs.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  const handleEmptyStatePress = () => {
    setInputText("What are some healthy meal ideas for the week?");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
        <EmptyState onPress={handleEmptyStatePress} />
      )}

      <View style={[styles.inputContainer, { marginTop: "auto" }]}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
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
    padding: scale(16),
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
    marginTop: scale(4),
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
