import { StyleSheet } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";
import { labelImage } from "vision-camera-image-labeler";

const CameraScreen = () => {
  const device = useCameraDevice("back");
  const { hasPermission } = useCameraPermission();

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const labels = labelImage(frame);
      const label = labels[0].label;
      console.log(`You're looking at a ${label}.`);
    },
    [labelImage]
  );

  //   if (!hasPermission) return <PermissionsPage />;
  if (device == null) return null;
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      frameProcessor={frameProcessor}
      device={device}
      isActive={true}
    />
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
