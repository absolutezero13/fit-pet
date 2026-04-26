import type { PropsWithChildren } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const TrueSheetProvider = ({ children }: PropsWithChildren) => {
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
};

export default TrueSheetProvider;
