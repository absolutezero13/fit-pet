import { Modal, Pressable, StyleSheet, View } from "react-native";
import GradientSpinner from "./GradientSpinner";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../theme/utils";

const FullPageSpinner = ({ visible }: { visible: boolean }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <GradientSpinner />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Optional: semi-transparent background
  },
});

export default FullPageSpinner;
