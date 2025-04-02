import { Modal, Pressable, StyleSheet, View } from "react-native";
import GradientSpinner from "./GradientSpinner";

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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Optional: semi-transparent background
  },
});

export default FullPageSpinner;
