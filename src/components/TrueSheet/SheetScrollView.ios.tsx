import { ScrollView } from "react-native";
import type { SheetScrollViewComponent } from "./types";

const SheetScrollView: SheetScrollViewComponent = ({ children, ...props }) => {
  return <ScrollView {...props}>{children}</ScrollView>;
};

export default SheetScrollView;
