import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";
import { scale } from "../theme/utils";

const GradientSpinner = ({ size = scale(100) }) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <ActivityIndicator size="large" color={colors["color-primary-50"]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  spinnerContainer: {
    width: scale(80),
    height: scale(80),
    position: "relative",
  },
  segment: {
    position: "absolute",
    width: scale(12),
    height: scale(12),
    borderRadius: 6,
    top: "50%",
    left: "50%",
    marginLeft: scale(-6),
    marginTop: scale(-6),
  },
  centerCircle: {
    position: "absolute",
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: colors["color-primary-200"],
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default GradientSpinner;
