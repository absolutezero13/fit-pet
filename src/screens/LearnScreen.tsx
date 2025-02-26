import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
// Sample article data about macros
const articles = [
  {
    id: 1,
    title: "Understanding Macronutrients: The Building Blocks of Nutrition",
    excerpt:
      "Learn the fundamentals of proteins, carbohydrates, and fats and their roles in your diet",
    image: `/api/placeholder/400/250`,
    category: "Nutrition Basics",
    readTime: "7 min",
  },
  {
    id: 2,
    title: "Protein Intake: How Much Do You Really Need?",
    excerpt:
      "Discover the optimal protein requirements for muscle building, weight loss, and maintenance",
    image: `/api/placeholder/400/250`,
    category: "Protein",
    readTime: "8 min",
  },
  {
    id: 3,
    title: "Carbohydrates: Friend or Foe?",
    excerpt:
      "Debunking common myths about carbs and understanding their importance in athletic performance",
    image: `/api/placeholder/400/250`,
    category: "Carbohydrates",
    readTime: "6 min",
  },
  {
    id: 4,
    title: "The Truth About Dietary Fats",
    excerpt:
      "Why healthy fats are essential for hormone production and overall wellness",
    image: `/api/placeholder/400/250`,
    category: "Fats",
    readTime: "9 min",
  },
  {
    id: 5,
    title: "Macro Tracking: Tools and Techniques",
    excerpt:
      "A comprehensive guide to tracking your macronutrients with apps and practical strategies",
    image: `/api/placeholder/400/250`,
    category: "Practical Guide",
    readTime: "10 min",
  },
  {
    id: 6,
    title: "Flexible Dieting: IIFYM Approach",
    excerpt:
      'How "If It Fits Your Macros" can help you achieve results while maintaining dietary freedom',
    image: `/api/placeholder/400/250`,
    category: "Dieting Strategies",
    readTime: "7 min",
  },
];

const ArticleCard = ({ article }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Image
        source={{ uri: article.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.categoryContainer}>
          <Text style={[fontStyles.caption, styles.category]}>
            {article.category}
          </Text>
          <Text style={[fontStyles.caption, styles.readTime]}>
            {article.readTime}
          </Text>
        </View>
        <Text
          style={[fontStyles.headline3, styles.cardTitle]}
          numberOfLines={2}
        >
          {article.title}
        </Text>
        <Text style={[fontStyles.body2, styles.cardExcerpt]} numberOfLines={3}>
          {article.excerpt}
        </Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read Article</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ArticlesPage = () => {
  // Split articles into two columns
  const leftColumnArticles = articles.filter((_, index) => index % 2 === 0);
  const rightColumnArticles = articles.filter((_, index) => index % 2 === 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors["color-primary-800"]} />

      <View style={styles.header}>
        <Text style={[fontStyles.headline1, styles.headerTitle]}>
          THIS IS A MOCK PAGE
        </Text>
        <Text style={[fontStyles.body1, styles.headerSubtitle]}>
          Master your nutrition with science-backed macro knowledge
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.columnsContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumnArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumnArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
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
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    backgroundColor: colors["color-primary-800"],
  },
  headerTitle: {
    color: "white",
    marginBottom: scale(4),
  },
  headerSubtitle: {
    color: colors["color-primary-200"],
  },
  scrollView: {
    flex: 1,
  },
  columnsContainer: {
    flexDirection: "row",
    paddingHorizontal: scale(10),
    paddingTop: scale(15),
  },
  column: {
    flex: 1,
    paddingHorizontal: scale(5),
  },
  card: {
    marginBottom: scale(15),
    borderRadius: scale(12),
    backgroundColor: "white",
    shadowColor: colors["color-primary-500"],
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    height: scale(120),
    width: "100%",
  },
  cardContent: {
    padding: scale(12),
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(6),
  },
  category: {
    color: colors["color-info-600"],
    fontFamily: "Nunito_600SemiBold",
  },
  readTime: {
    color: colors["color-primary-400"],
  },
  cardTitle: {
    fontSize: scale(16),
    lineHeight: scale(22),
    marginBottom: scale(6),
  },
  cardExcerpt: {
    color: colors["color-primary-400"],
    marginBottom: scale(12),
  },
  cardFooter: {
    marginTop: scale(6),
  },
  readMoreButton: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(10),
    backgroundColor: colors["color-primary-800"],
    borderRadius: scale(4),
    alignSelf: "flex-start",
  },
  readMoreText: {
    ...fontStyles.caption,
    color: "white",
    fontFamily: "Nunito_600SemiBold",
  },
});

export default ArticlesPage;
