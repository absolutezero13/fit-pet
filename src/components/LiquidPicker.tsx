import { Host, Picker } from "@expo/ui/swift-ui";
import { scale } from "../theme/utils";
import {
  cornerRadius,
  frame,
  glassEffect,
  padding,
} from "@expo/ui/swift-ui/modifiers";

function LiquidPicker({
  options,
  selectedIndex,
  onSelected,
}: {
  options: string[];
  selectedIndex: number;
  onSelected: (index: number) => void;
}) {
  return (
    <Host
      matchContents
      style={{
        alignSelf: "center",
      }}
    >
      <Picker
        options={options}
        selectedIndex={selectedIndex}
        onOptionSelected={({ nativeEvent: { index } }) => {
          onSelected(index);
        }}
        variant="segmented"
        modifiers={[
          frame({ width: scale(200) }),
          cornerRadius(scale(99)),
          padding({}),
          glassEffect({ glass: { variant: "regular" } }),
        ]}
      />
    </Host>
  );
}

export default LiquidPicker;
