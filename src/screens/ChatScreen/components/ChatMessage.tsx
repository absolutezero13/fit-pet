import { StyleSheet, Text, View } from "react-native";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import Markdown, {
  RenderRules,
} from "@ronradtke/react-native-markdown-display";
import MessageSkeleton from "./Skeleton";
import StreamingText from "./StreamingText";
import { useTheme } from "../../../theme/ThemeContext";

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
  streaming,
  onStreamComplete,
}: {
  message?: IChatMessage;
  loading?: boolean;
  streaming?: boolean;
  onStreamComplete?: () => void;
}) => {
  const { colors } = useTheme();
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
        isUser
          ? [
              styles.userMessageContainer,
              { backgroundColor: colors.white },
            ]
          : [styles.botMessageContainer, { backgroundColor: colors.surface }],
      ]}
    >
      {loading ? (
        <MessageSkeleton />
      ) : (
        <>
          <View>
            {streaming && !isUser ? (
              <StreamingText
                text={message?.text || ""}
                textColor={colors.text}
                onComplete={onStreamComplete}
                charsPerFrame={2}
                frameDelay={20}
              />
            ) : (
              <MarkdownWrapper textColor={isUser ? colors.textInverse : colors.text}>
                {message?.text}
              </MarkdownWrapper>
            )}
          </View>
          <Text
            style={[
              styles.messageTime,
              isUser
                ? [styles.userMessageTime, { color: colors.textInverse }]
                : [styles.botMessageTime, { color: colors.textSecondary }],
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
  },
  botMessageContainer: {
    alignSelf: "flex-start",
  },
  messageText: {
    ...fontStyles.body1,
  },
  userMessageText: {},
  botMessageText: {},
  messageTime: {
    ...fontStyles.caption,
    alignSelf: "flex-end",
  },
  userMessageTime: {},
  botMessageTime: {},
});

export default ChatMessage;
