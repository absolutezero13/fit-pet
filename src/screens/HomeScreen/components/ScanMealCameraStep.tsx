import { RefObject } from "react";
import {
  Camera,
  type CameraDevice,
  type CameraDeviceFormat,
} from "react-native-vision-camera";
import { scale, SCREEN_HEIGHT } from "../../../theme/utils";
import { Pressable, StyleSheet, View, Platform } from "react-native";
import { lightColors } from "../../../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScanMealCameraStepProps = {
  device: CameraDevice;
  format: CameraDeviceFormat | undefined;
  cameraRef: RefObject<Camera | null>;
  onTakePhoto: () => void;
};

const ScanMealCameraStep = (props: ScanMealCameraStepProps) => {
  const insets = useSafeAreaInsets();
  const cameraHeightAndroid = SCREEN_HEIGHT - insets.top - insets.bottom;

  return (
    <View style={styles.cameraContainer}>
      <Camera
        photo={true}
        ref={props.cameraRef}
        device={props.device}
        format={props.format}
        isActive={true}
        style={[
          styles.camera,
          {
            height: Platform.select({
              default: scale(500),
              android: cameraHeightAndroid,
            }),
          },
        ]}
        photoQualityBalance="speed"
      />
      <Pressable onPress={props.onTakePhoto} style={styles.takePhotoButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    height: scale(500),
    width: "100%",
  },
  cameraContainer: {
    position: "relative",
  },
  takePhotoButton: {
    position: "absolute",
    bottom: scale(24),
    backgroundColor: lightColors["color-danger-500"],
    zIndex: 99,
    height: scale(80),
    width: scale(80),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 5,
    borderColor: lightColors["color-primary-100"],
  },
});

export default ScanMealCameraStep;
