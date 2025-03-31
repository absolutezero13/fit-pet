import { useState, useEffect } from "react";
import { Platform, Keyboard } from "react-native";

const useKeyboardVisible = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardShowListener = Keyboard.addListener(keyboardShowEvent, () => {
      setKeyboardVisible(true);
    });

    const keyboardHideListener = Keyboard.addListener(keyboardHideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  return isKeyboardVisible;
};

export default useKeyboardVisible;
