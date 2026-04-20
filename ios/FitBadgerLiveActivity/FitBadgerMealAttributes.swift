import ActivityKit
import Foundation

public struct FitBadgerMealAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var caloriesConsumed: Int
    public var caloriesGoal: Int
    public var proteinsGrams: Int
    public var proteinsGoal: Int
    public var carbsGrams: Int
    public var carbsGoal: Int
    public var fatsGrams: Int
    public var fatsGoal: Int
    public var lastMealTitle: String
    public var lastMealEmoji: String
    public var mealCount: Int

    public init(
      caloriesConsumed: Int,
      caloriesGoal: Int,
      proteinsGrams: Int,
      proteinsGoal: Int,
      carbsGrams: Int,
      carbsGoal: Int,
      fatsGrams: Int,
      fatsGoal: Int,
      lastMealTitle: String,
      lastMealEmoji: String,
      mealCount: Int
    ) {
      self.caloriesConsumed = caloriesConsumed
      self.caloriesGoal = caloriesGoal
      self.proteinsGrams = proteinsGrams
      self.proteinsGoal = proteinsGoal
      self.carbsGrams = carbsGrams
      self.carbsGoal = carbsGoal
      self.fatsGrams = fatsGrams
      self.fatsGoal = fatsGoal
      self.lastMealTitle = lastMealTitle
      self.lastMealEmoji = lastMealEmoji
      self.mealCount = mealCount
    }
  }

  public var startedAt: Date

  public init(startedAt: Date) {
    self.startedAt = startedAt
  }
}
