import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { SheetScrollViewComponent } from "./types";

const SheetScrollView: SheetScrollViewComponent = ({ children, ...props }) => {
  return <BottomSheetScrollView {...props}>{children ?? null}</BottomSheetScrollView>;
};

export default SheetScrollView;
