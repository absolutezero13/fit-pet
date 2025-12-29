import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { View } from "react-native";

const GlassView = isLiquidGlassSupported ? LiquidGlassView : View;

export default GlassView;
