import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  PanResponder,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../theme/utils";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MealTypeSection = ({ title, meals, onPressItem }) => {
  if (meals.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {meals.map((meal, index) => (
        <TouchableOpacity
          key={index}
          style={styles.mealItem}
          onPress={() => onPressItem(meal)}
        >
          <View style={styles.mealItemContent}>
            <View style={styles.mealItemLeft}>
              <Text style={styles.mealItemTitle}>
                {meal.description.split(".")[0]}
              </Text>
              <Text style={styles.mealItemTime}>{meal.time}</Text>
            </View>

            <View style={styles.mealItemRight}>
              <Text style={styles.caloriesText}>{meal.calories} cal</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scale(24)}
                color={colors["color-primary-300"]}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LogMealModal = ({ visible, onClose, onAddMeal }) => {
  const [mealDescription, setMealDescription] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("Breakfast");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

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

      setAiResponse(response);
      setIsAnalyzing(false);
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

    const newMeal = {
      id: Date.now().toString(),
      mealType: selectedMealType,
      description: mealDescription,
      time: formattedTime,
      calories: aiResponse.calories.toString(),
      proteins: aiResponse.proteins.toString(),
      carbs: aiResponse.carbs.toString(),
      fats: aiResponse.fats.toString(),
    };

    onAddMeal(newMeal);
    closeModal();
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

const LoggedMealsScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const [meals, setMeals] = useState([]);
  const [organizedMeals, setOrganizedMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    // In a real app, this would fetch from local storage or an API
    // For now using sample data
    const sampleMeals = [
      {
        id: "1",
        mealType: "Breakfast",
        description: "Oatmeal with berries and honey. Rich in fiber.",
        time: "7:30 AM",
        calories: "350",
        proteins: "12",
        carbs: "45",
        fats: "8",
      },
      {
        id: "2",
        mealType: "Lunch",
        description:
          "Grilled chicken salad with olive oil dressing. High protein lunch.",
        time: "12:30 PM",
        calories: "450",
        proteins: "35",
        carbs: "20",
        fats: "15",
      },
      {
        id: "3",
        mealType: "Dinner",
        description: "Salmon with roasted vegetables. Omega-3 rich dinner.",
        time: "6:45 PM",
        calories: "520",
        proteins: "38",
        carbs: "25",
        fats: "22",
      },
      {
        id: "4",
        mealType: "Snack",
        description: "Greek yogurt with nuts. Protein-rich afternoon snack.",
        time: "3:15 PM",
        calories: "180",
        proteins: "15",
        carbs: "10",
        fats: "8",
      },
    ];

    setMeals(sampleMeals);
  }, []);

  useEffect(() => {
    // Organize meals by type
    const organized = {
      breakfast: meals.filter(
        (meal) => meal.mealType.toLowerCase() === "breakfast"
      ),
      lunch: meals.filter((meal) => meal.mealType.toLowerCase() === "lunch"),
      dinner: meals.filter((meal) => meal.mealType.toLowerCase() === "dinner"),
      snack: meals.filter((meal) => meal.mealType.toLowerCase() === "snack"),
    };

    setOrganizedMeals(organized);
  }, [meals]);

  const handleMealPress = (meal) => {
    // Navigate to meal detail or edit screen
    console.log("Meal pressed:", meal);
    // navigation.navigate('MealDetail', { meal });
  };

  const handleAddMeal = (newMeal) => {
    setMeals((prevMeals) => [...prevMeals, newMeal]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logged Meals</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MealTypeSection
          title="Breakfast"
          meals={organizedMeals.breakfast}
          onPressItem={handleMealPress}
        />

        <MealTypeSection
          title="Lunch"
          meals={organizedMeals.lunch}
          onPressItem={handleMealPress}
        />

        <MealTypeSection
          title="Dinner"
          meals={organizedMeals.dinner}
          onPressItem={handleMealPress}
        />

        <MealTypeSection
          title="Snacks"
          meals={organizedMeals.snack}
          onPressItem={handleMealPress}
        />
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.addButton,
          {
            bottom: bottom + scale(64),
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={scale(24)} color="white" />
      </TouchableOpacity>

      <LogMealModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddMeal={handleAddMeal}
      />
    </View>
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

export default LoggedMealsScreen;
