import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { CircularProgress, Host } from "@expo/ui/swift-ui";

export type IChatMessage = {
  id: string;
  text: string;
  role: "user" | "model";
  timestamp: Date;
};

const ChatMessage = ({
  message,
  loading,
}: {
  message?: IChatMessage;
  loading?: boolean;
}) => {
  const time = message?.timestamp.toLocaleTimeString("tr-TR", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const isUser = !loading && message?.role === "user";

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {loading ? (
        <Host matchContents>
          <CircularProgress
            progress={0.5}
            color={colors["color-primary-500"]}
          />
        </Host>
      ) : (
        <>
          <View style={styles.messageContent}>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {message?.text}
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ChatMessage;
