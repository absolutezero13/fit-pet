import type React from "react";
import type {
  ReactNode,
} from "react";
import type {
  ScrollViewProps,
  StyleProp,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { TrueSheetNames } from "../../navigation/constants";

export type TrueSheetDetent = "auto" | number;

export type TrueSheetProps = {
  children: ReactNode;
  name: TrueSheetNames;
  detents?: TrueSheetDetent[];
  maxHeight?: number;
  blurTint?: string;
  insetAdjustment?: "never" | "automatic";
  onWillPresent?: () => void;
  onDidDismiss?: () => void;
  blurOptions?: {
    interaction?: boolean;
    intensity?: number;
  };
  dismissible?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  keyboardBehavior?: "interactive" | "extend" | "fillParent";
};

export type TrueSheetController = {
  present: (name: TrueSheetNames) => Promise<void>;
  dismiss: (name: TrueSheetNames) => Promise<void>;
};

export type FocusableInput = {
  focus: () => void;
  blur: () => void;
};

export type SheetTextInputProps = TextInputProps;

export type SheetScrollViewProps = ScrollViewProps;

export type SheetTextInputComponent =
  React.ForwardRefExoticComponent<
    SheetTextInputProps & React.RefAttributes<FocusableInput>
  >;

export type SheetScrollViewComponent = React.ComponentType<SheetScrollViewProps>;
