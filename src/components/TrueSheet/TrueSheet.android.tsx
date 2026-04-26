import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";
import { TrueSheetNames } from "../../navigation/constants";
import { useTheme } from "../../theme/ThemeContext";
import type { TrueSheetController, TrueSheetProps } from "./types";

type TrueSheetStore = {
  activeSheet: TrueSheetNames | null;
  present: (name: TrueSheetNames) => void;
  dismiss: (name: TrueSheetNames) => void;
};

const useTrueSheetStore = create<TrueSheetStore>((set) => ({
  activeSheet: null,
  present: (name) => set({ activeSheet: name }),
  dismiss: (name) =>
    set((state) =>
      state.activeSheet === name ? { activeSheet: null } : state,
    ),
}));

const mapDetentToSnapPoint = (detent: number) => `${Math.round(detent * 100)}%`;

const present = async (name: TrueSheetNames) => {
  useTrueSheetStore.getState().present(name);
};

const dismiss = async (name: TrueSheetNames) => {
  useTrueSheetStore.getState().dismiss(name);
};

const TrueSheetBase = ({
  children,
  name,
  detents,
  maxHeight,
  onWillPresent,
  onDidDismiss,
  dismissible = true,
  backgroundColor,
  style,
  scrollable = false,
  keyboardBehavior = "interactive",
}: TrueSheetProps) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const onWillPresentRef = useRef(onWillPresent);
  const onDidDismissRef = useRef(onDidDismiss);
  const activeSheet = useTrueSheetStore((state) => state.activeSheet);
  const { colors, isDark } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isActive = activeSheet === name;
  const hasAutoDetent = detents?.includes("auto") ?? false;

  useEffect(() => {
    onWillPresentRef.current = onWillPresent;
  }, [onWillPresent]);

  useEffect(() => {
    onDidDismissRef.current = onDidDismiss;
  }, [onDidDismiss]);

  const numericDetents = useMemo(
    () =>
      (detents ?? []).filter(
        (detent): detent is number => typeof detent === "number",
      ),
    [detents],
  );

  const snapPoints = useMemo(() => {
    if (hasAutoDetent) {
      return numericDetents.length
        ? numericDetents.map(mapDetentToSnapPoint)
        : undefined;
    }

    if (!numericDetents.length) {
      return ["90%"];
    }

    return numericDetents.map(mapDetentToSnapPoint);
  }, [hasAutoDetent, numericDetents]);

  const maxDynamicContentSize =
    maxHeight ?? Math.floor((windowHeight - insets.top) * 0.92);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={isDark ? 0.6 : 0.35}
        pressBehavior={dismissible ? "close" : "none"}
      />
    ),
    [dismissible, isDark],
  );

  const handleDismiss = useCallback(() => {
    useTrueSheetStore.getState().dismiss(name);
    onDidDismissRef.current?.();
  }, [name]);

  useEffect(() => {
    if (isActive) {
      onWillPresentRef.current?.();
      requestAnimationFrame(() => {
        modalRef.current?.present();
      });
      return;
    }

    modalRef.current?.dismiss();
  }, [isActive]);

  return (
    <BottomSheetModal
      ref={modalRef}
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.background,
        { backgroundColor: backgroundColor ?? colors.surface },
      ]}
      enableDismissOnClose
      enableContentPanningGesture={false}
      enableDynamicSizing={hasAutoDetent}
      enablePanDownToClose={dismissible}
      bottomInset={insets.bottom}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      index={0}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="restore"
      maxDynamicContentSize={maxDynamicContentSize}
      onDismiss={handleDismiss}
      snapPoints={snapPoints}
      topInset={insets.top}
    >
      {scrollable ? (
        children
      ) : (
        <BottomSheetView style={[styles.content, style]}>{children}</BottomSheetView>
      )}
    </BottomSheetModal>
  );
};

type TrueSheetComponent = React.FC<TrueSheetProps> & TrueSheetController;

export const TrueSheet = Object.assign(TrueSheetBase, {
  present,
  dismiss,
}) as TrueSheetComponent;

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    overflow: "hidden",
  },
});

export type { TrueSheetController, TrueSheetProps } from "./types";
