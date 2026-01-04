import React, { useEffect, useRef, useReducer, memo } from "react";
import { StyleSheet, Text } from "react-native";
import Markdown, {
  RenderRules,
} from "@ronradtke/react-native-markdown-display";
import { fontStyles } from "../../../theme/fontStyles";

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

interface StreamingTextProps {
  text: string;
  textColor: string;
  onComplete?: () => void;
  /** Characters to reveal per frame (higher = faster) */
  charsPerFrame?: number;
  /** Delay between frames in ms */
  frameDelay?: number;
}

/**
 * StreamingText component that reveals text character by character
 * Uses refs and requestAnimationFrame for efficient updates
 * Only triggers re-render when necessary (batched updates)
 */
const StreamingText: React.FC<StreamingTextProps> = memo(
  ({ text, textColor, onComplete, charsPerFrame = 3, frameDelay = 16 }) => {
    // Use a ref to track current position - no state updates per character
    const positionRef = useRef(0);
    const displayedTextRef = useRef("");
    const isCompleteRef = useRef(false);
    const frameIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef(0);

    // Force update mechanism without useState for the text itself
    // We use useReducer as a minimal re-render trigger
    const [, forceRender] = useReducer((x) => x + 1, 0);

    useEffect(() => {
      // Reset on new text
      positionRef.current = 0;
      displayedTextRef.current = "";
      isCompleteRef.current = false;

      const animate = (timestamp: number) => {
        // Throttle based on frameDelay
        if (timestamp - lastFrameTimeRef.current < frameDelay) {
          frameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        lastFrameTimeRef.current = timestamp;

        if (positionRef.current >= text.length) {
          if (!isCompleteRef.current) {
            isCompleteRef.current = true;
            onComplete?.();
          }
          return;
        }

        // Advance position by charsPerFrame
        positionRef.current = Math.min(
          positionRef.current + charsPerFrame,
          text.length
        );
        displayedTextRef.current = text.slice(0, positionRef.current);

        // Trigger minimal re-render
        forceRender();

        // Continue animation
        frameIdRef.current = requestAnimationFrame(animate);
      };

      frameIdRef.current = requestAnimationFrame(animate);

      return () => {
        if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current);
        }
      };
    }, [text, charsPerFrame, frameDelay, onComplete]);

    return (
      <Markdown
        rules={markDownRules}
        style={StyleSheet.create({ text: { color: textColor } })}
      >
        {displayedTextRef.current}
      </Markdown>
    );
  }
);

StreamingText.displayName = "StreamingText";

export default StreamingText;
