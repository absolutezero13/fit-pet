import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import { scale, shadowStyle } from "../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// This component displays a nutrient bar
const NutrientBar = ({ label, value, maxValue, color }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <View style={styles.nutrientBarContainer}>
      <View style={styles.nutrientLabelContainer}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>{value}g</Text>
      </View>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

// This component displays a meal recommendation card
const RecommendationCard = ({ title, description }) => (
  <View style={styles.recommendationCard}>
    <MaterialCommunityIcons
      name="lightbulb-outline"
      size={scale(24)}
      color={colors["color-primary-500"]}
    />
    <View style={styles.recommendationContent}>
      <Text style={styles.recommendationTitle}>{title}</Text>
      <Text style={styles.recommendationDescription}>{description}</Text>
    </View>
  </View>
);

const AnalyzedMealScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bottom } = useSafeAreaInsets();
  const meal = route.params?.meal;
  
  // Fallback data in case params are missing
  const [mealData, setMealData] = useState({
    id: "placeholder",
    mealType: "Meal",
    description: "No meal data available",
    time: "00:00",
    calories: "0",
    proteins: "0",
    carbs: "0",
    fats: "0",
  });
  
  // Maximum nutrient values for bars (in grams)
  const maxValues = {
    proteins: 50,
    carbs: 100,
    fats: 40
  };
  
  useEffect(() => {
    if (meal) {
      setMealData(meal);
    }
  }, [meal]);

  const handleDone = () => {
    navigation.goBack();
  };

  // Recommendations based on meal macros (simplified for demo)
  const generateRecommendations = () => {
    const proteins = parseInt(mealData.proteins);
    const carbs = parseInt(mealData.carbs);
    const fats = parseInt(mealData.fats);
    
    const recommendations = [];
    
    if (proteins < 15) {
      recommendations.push({
        title: "Increase Protein",
        description: "This meal is low in protein. Consider adding lean meats, eggs, tofu, or legumes."
      });
    }
    
    if (carbs > 60) {
      recommendations.push({
        title: "High Carbohydrates",
        description: "This meal is high in carbs. Consider reducing portion sizes or substituting with vegetables."
      });
    }
    
    if (fats > 20) {
      recommendations.push({
        title: "Watch Fat Intake",
        description: "This meal contains significant fat. Consider healthier fat sources like avocados or nuts."
      });
    }
    
    // Add a general recommendation if no specific ones were generated
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Well-Balanced Meal",
        description: "This meal appears to be well-balanced. Good job on your nutrition choices!"
      });
    }
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={scale(24)}
            color={colors["color-primary-500"]}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Meal Analysis</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + scale(24) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{mealData.mealType}</Text>
            <Text style={styles.mealTime}>{mealData.time}</Text>
          </View>
          
          <Text style={styles.mealDescription}>{mealData.description}</Text>
          
          <View style={styles.calorieContainer}>
            <View style={styles.calorieBox}>
              <Text style={styles.calorieValue}>{mealData.calories}</Text>
              <Text style={styles.calorieLabel}>Calories</Text>
            </View>
          </View>
          
          <View style={styles.nutrientsContainer}>
            <Text style={styles.sectionTitle}>Macronutrients</Text>
            
            <NutrientBar 
              label="Protein" 
              value={parseInt(mealData.proteins)}
              maxValue={maxValues.proteins}
              color={colors["color-success-400"]}
            />
            
            <NutrientBar 
              label="Carbs" 
              value={parseInt(mealData.carbs)}
              maxValue={maxValues.carbs}
              color={colors["color-primary-400"]}
            />
            
            <NutrientBar 
              label="Fats" 
              value={parseInt(mealData.fats)}
              maxValue={maxValues.fats}
              color={colors["color-warning-400"]}
            />
          </View>
        </View>
        
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              title={recommendation.title}
              description={recommendation.description}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(24),
    paddingTop: scale(16),
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
  backButton: {
    marginRight: scale(16),
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
  },
  mealCard: {
    backgroundColor: "white",
    borderRadius: scale(20),
    padding: scale(24),
    marginBottom: scale(24),
    ...shadowStyle,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  mealType: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
  mealTime: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
  },
  mealDescription: {
    ...fontStyles.body1,
    marginBottom: scale(20),
  },
  calorieContainer: {
    alignItems: "center",
    marginBottom: scale(24),
  },
  calorieBox: {
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(16),
    padding: scale(16),
    alignItems: "center",
    width: "50%",
  },
  calorieValue: {
    ...fontStyles.headline1,
    color: colors["color-success-500"],
  },
  calorieLabel: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
  },
  nutrientsContainer: {
    marginBottom: scale(16),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
  },
  nutrientBarContainer: {
    marginBottom: scale(16),
  },
  nutrientLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(8),
  },
  nutrientLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  nutrientValue: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    fontWeight: "bold",
  },
  barBackground: {
    height: scale(12),
    backgroundColor: colors["color-primary-200"],
    borderRadius: scale(6),
  },
  barFill: {
    height: "100%",
    borderRadius: scale(6),
  },
  recommendationsContainer: {
    backgroundColor: "white",
    borderRadius: scale(20),
    padding: scale(24),
    marginBottom: scale(24),
    ...shadowStyle,
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(16),
  },
  recommendationContent: {
    flex: 1,
    marginLeft: scale(12),
  },
  recommendationTitle: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
    marginBottom: scale(4),
  },
  recommendationDescription: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
  },
});

export default AnalyzedMealScreen;