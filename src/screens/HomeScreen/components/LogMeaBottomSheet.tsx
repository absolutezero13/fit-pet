import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  PanResponder,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Text,
} from "react-native";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LogMealModal = ({ visible, onClose, onAddMeal }) => {
  const [mealDescription, setMealDescription] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("Breakfast");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current; // Start from below screen
  const translateY = useRef(new Animated.Value(0)).current;

  // Handle swipe down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow downward swipes
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Threshold to close
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Combined animations when opening
  useEffect(() => {
    if (visible) {
      // Reset position before animation starts
      slideAnim.setValue(300);
      translateY.setValue(0);

      // Fade in overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Slide up modal
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const closeModal = () => {
    // Parallel animations for closing
    Animated.parallel([
      // Fade out overlay
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      // Slide down modal
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      resetModal();
    });
  };

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const analyzeMeal = () => {
    if (!mealDescription.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI response with a timer
    // In a real app, this would be an API call to your AI service
    setTimeout(() => {
      // Generate mock AI response
      const calories = Math.floor(Math.random() * 500) + 100;
      const proteins = Math.floor(Math.random() * 40) + 5;
      const carbs = Math.floor(Math.random() * 50) + 10;
      const fats = Math.floor(Math.random() * 25) + 3;

      const response = {
        calories,
        proteins,
        carbs,
        fats,
      };
      const currentTime = new Date();

      const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const newMeal = {
        id: Date.now().toString(),
        mealType: selectedMealType,
        description: mealDescription,
        time: formattedTime,
        calories: calories.toString(),
        proteins: proteins.toString(),
        carbs: carbs.toString(),
        fats: fats.toString(),
      };

      navigation.navigate("AnalyzedMeal", { meal: newMeal });
    }, 1500);
  };

  const handleSaveMeal = () => {
    if (!mealDescription.trim() || !aiResponse) return;

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    onAddMeal(newMeal);
    closeModal();

    // Navigate to the AnalyzedMeal screen with the meal data
    navigation.navigate("AnalyzedMeal", { meal: newMeal });
  };

  const resetModal = () => {
    setMealDescription("");
    setSelectedMealType("Breakfast");
    setAiResponse(null);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={closeModal}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  { translateY: slideAnim },
                  { translateY: translateY },
                ],
              },
            ]}
          >
            {/* Swipe indicator handle */}
            <View
              {...panResponder.panHandlers}
              style={styles.swipeIndicatorContainer}
            >
              <View style={styles.swipeIndicator} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log a Meal</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialCommunityIcons
                  name="close"
                  size={scale(24)}
                  color={colors["color-primary-500"]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Describe your meal</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Example: Scrambled eggs with spinach and whole grain toast"
                value={mealDescription}
                onChangeText={setMealDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.mealTypeContainer}>
              <Text style={styles.inputLabel}>Meal Type</Text>
              <View style={styles.mealTypeOptions}>
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === type && styles.mealTypeButtonActive,
                    ]}
                    onPress={() => setSelectedMealType(type)}
                  >
                    <Text
                      style={[
                        styles.mealTypeText,
                        selectedMealType === type && styles.mealTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {!aiResponse && (
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  !mealDescription.trim() && styles.disabledButton,
                ]}
                onPress={analyzeMeal}
                disabled={!mealDescription.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Analyze Meal</Text>
                )}
              </TouchableOpacity>
            )}

            {aiResponse && (
              <>
                <View style={styles.nutritionContainer}>
                  <Text style={styles.nutritionTitle}>
                    Nutrition Information
                  </Text>

                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {aiResponse.calories}
                      </Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>

                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {aiResponse.proteins}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>

                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {aiResponse.carbs}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>

                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {aiResponse.fats}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Fats</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMeal}
                >
                  <Text style={styles.buttonText}>Save Meal</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    padding: scale(24),
    paddingTop: scale(60),
    paddingBottom: scale(32),
    backgroundColor: colors["color-primary-200"],
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
  },
  title: {
    ...fontStyles.headline1,
  },
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: scale(100),
  },
  sectionContainer: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
  },
  mealItem: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(12),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  mealItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealItemLeft: {
    flex: 1,
  },
  mealItemTitle: {
    ...fontStyles.headline4,
    marginBottom: scale(4),
  },
  mealItemTime: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  mealItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesText: {
    ...fontStyles.body2,
    color: colors["color-success-400"],
    marginRight: scale(8),
  },
  addButton: {
    position: "absolute",
    bottom: scale(32),
    right: scale(32),
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors["color-success-400"],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors["color-success-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 5,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: scale(30),
    borderTopRightRadius: scale(30),
    paddingHorizontal: scale(24),
    paddingTop: scale(8), // Reduced padding for swipe indicator
    paddingBottom: scale(48),
    marginBottom: scale(-40), // Overlap with overlay
  },
  swipeIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: scale(8),
  },
  swipeIndicator: {
    width: scale(40),
    height: scale(5),
    backgroundColor: colors["color-primary-300"],
    borderRadius: scale(3),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(24),
  },
  modalTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
  },
  inputContainer: {
    marginBottom: scale(20),
  },
  inputLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    marginBottom: scale(8),
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors["color-primary-300"],
    borderRadius: scale(12),
    padding: scale(12),
    ...fontStyles.body1,
    minHeight: scale(100),
    textAlignVertical: "top",
  },
  mealTypeContainer: {
    marginBottom: scale(24),
  },
  mealTypeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: scale(-4),
  },
  mealTypeButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    backgroundColor: colors["color-primary-100"],
    marginHorizontal: scale(4),
    marginBottom: scale(8),
  },
  mealTypeButtonActive: {
    backgroundColor: colors["color-primary-400"],
  },
  mealTypeText: {
    ...fontStyles.body2,
    color: colors["color-primary-500"],
  },
  mealTypeTextActive: {
    color: "white",
  },
  analyzeButton: {
    backgroundColor: colors["color-success-400"],
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginTop: scale(16),
  },
  disabledButton: {
    backgroundColor: colors["color-primary-300"],
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: colors["color-primary-500"],
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginTop: scale(16),
  },
  buttonText: {
    ...fontStyles.headline4,
    color: "white",
  },
  nutritionContainer: {
    marginTop: scale(24),
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(16),
    padding: scale(16),
  },
  nutritionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
    textAlign: "center",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(12),
    alignItems: "center",
  },
  nutritionValue: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
  },
  nutritionLabel: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
  },
});

export default LogMealModal;
