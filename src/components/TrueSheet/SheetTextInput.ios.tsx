import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { TextInput } from "react-native";
import type { FocusableInput, SheetTextInputProps } from "./types";

const SheetTextInput = forwardRef<FocusableInput, SheetTextInputProps>(
  (props, ref) => {
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
    }));

    return <TextInput ref={inputRef} {...props} />;
  },
);

SheetTextInput.displayName = "SheetTextInput";

export default SheetTextInput;
