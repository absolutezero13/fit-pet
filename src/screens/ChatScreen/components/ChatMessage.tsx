import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import Markdown, {
  RenderRules,
} from "@ronradtke/react-native-markdown-display";
import MessageSkeleton from "./Skeleton";

export type IChatMessage = {
  id: string;
  text: string;
  role: "user" | "model";
  timestamp: Date;
};

const markDownRules: RenderRules = {
  heading1: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.headline1, styles.heading1]}>
      {children}
    </Text>
  ),
  heading2: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.headline2, styles.heading2]}>
      {children}
    </Text>
  ),
  heading3: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.headline3, styles.heading3]}>
      {children}
    </Text>
  ),
  heading4: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.headline4, styles.heading4]}>
      {children}
    </Text>
  ),
  paragraph: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.body1, styles.paragraph]}>
      {children}
    </Text>
  ),
  list_item: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.body1, styles.listItem]}>
      {"• "} {children} {"\n"}
    </Text>
  ),
  bullet_list: (node, children, parent, styles) => (
    <Text key={node.key} style={[fontStyles.body1, styles.bulletList]}>
      {"• "} {children} {"\n"}
    </Text>
  ),
};

const MarkdownWrapper: React.FC<any> = ({ children, textColor }) => {
  return (
    <Markdown
      rules={markDownRules}
      style={StyleSheet.create({ text: { color: textColor } })}
    >
      {children}
    </Markdown>
  );
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
        <MessageSkeleton />
      ) : (
        <>
          <View>
            <MarkdownWrapper
              textColor={isUser ? "white" : colors["color-primary-500"]}
            >
              {message?.text}
            </MarkdownWrapper>
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
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: colors["color-success-400"],
  },
  botMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  messageText: {
    ...fontStyles.body1,
  },
  userMessageText: {
    color: colors["color-primary-50"],
  },
  botMessageText: {
    color: colors["color-primary-800"],
  },
  messageTime: {
    ...fontStyles.caption,
    alignSelf: "flex-end",
  },
  userMessageTime: {
    color: colors["color-primary-200"],
  },
  botMessageTime: {
    color: colors["color-primary-400"],
  },
});

export default ChatMessage;
