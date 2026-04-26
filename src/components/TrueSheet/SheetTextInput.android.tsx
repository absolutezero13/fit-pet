import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import type { FocusableInput, SheetTextInputProps } from "./types";

type BottomSheetInputRef = React.ElementRef<typeof BottomSheetTextInput>;

const SheetTextInput = forwardRef<FocusableInput, SheetTextInputProps>(
  (props, ref) => {
    const inputRef = useRef<BottomSheetInputRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
    }));

    return <BottomSheetTextInput ref={inputRef} {...props} />;
  },
);

SheetTextInput.displayName = "SheetTextInput";

export default SheetTextInput;
