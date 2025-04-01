import React, { useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { scale } from "../theme/utils";

const GradientSpinner = ({ size = scale(100) }) => {
  const rotation = new Animated.Value(0);
  const fadeValues = Array(5)
    .fill("")
    .map(() => new Animated.Value(0.4));

  useEffect(() => {
    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Sequential fade animations for segments
    const createFadeAnimation = (index: number) => {
      return Animated.sequence([
        Animated.timing(fadeValues[index], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValues[index], {
          toValue: 0.4,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    const animateSegments = () => {
      Animated.stagger(
        150,
        fadeValues.map((_, index) => createFadeAnimation(index))
      ).start(() => animateSegments());
    };

    animateSegments();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Color values for the segments
  const segmentColors = [
    colors["color-info-400"],
    colors["color-primary-400"],
    colors["color-success-400"],
    colors["color-warning-400"],
    colors["color-info-500"],
  ];

  // Create spinner segments
  const renderSegments = () => {
    return Array(5)
      .fill("")
      .map((_, index) => {
        const rotateValue = `${index * 72}deg`;

        return (
          <Animated.View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: segmentColors[index],
                transform: [{ rotate: rotateValue }, { translateY: -30 }],
                opacity: fadeValues[index],
              },
            ]}
          />
        );
      });
  };

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
      <Animated.View
        style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}
      >
        {renderSegments()}
      </Animated.View>

      <View style={styles.centerCircle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors["color-primary-100"],
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
    marginLeft: -6,
    marginTop: -6,
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
