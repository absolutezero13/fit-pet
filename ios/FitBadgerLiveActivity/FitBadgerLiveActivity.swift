import ActivityKit
import SwiftUI
import WidgetKit

private extension Color {
  static let macroCalories = Color(red: 245.0 / 255.0, green: 166.0 / 255.0, blue: 35.0 / 255.0)
  static let macroProtein = Color(red: 63.0 / 255.0, green: 183.0 / 255.0, blue: 92.0 / 255.0)
  static let macroCarbs = Color(red: 54.0 / 255.0, green: 185.0 / 255.0, blue: 207.0 / 255.0)
  static let macroFats = Color(red: 255.0 / 255.0, green: 112.0 / 255.0, blue: 67.0 / 255.0)
}

@main
struct FitBadgerWidgetBundle: WidgetBundle {
  var body: some Widget {
    FitBadgerMealLiveActivity()
  }
}

struct FitBadgerMealLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: FitBadgerMealAttributes.self) { context in
      LockScreenView(state: context.state)
        .padding(16)
        .activityBackgroundTint(Color.black.opacity(0.85))
        .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          VStack(alignment: .leading, spacing: 2) {
            Text("\(context.state.caloriesConsumed)")
              .font(.system(size: 22, weight: .bold))
              .foregroundColor(.white)
            Text("/ \(context.state.caloriesGoal) kcal")
              .font(.system(size: 11))
              .foregroundColor(.white.opacity(0.7))
          }
          .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(context.state.lastMealEmoji)
            .font(.system(size: 28))
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.center) {
          Text("\(context.state.mealCount) meals today")
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(.white.opacity(0.8))
        }
        DynamicIslandExpandedRegion(.bottom) {
          MacroRowView(state: context.state)
            .padding(.horizontal, 4)
            .padding(.top, 4)
        }
      } compactLeading: {
        Text("\(context.state.caloriesConsumed)")
          .font(.system(size: 13, weight: .semibold))
          .foregroundColor(.macroCalories)
      } compactTrailing: {
        Text(context.state.lastMealEmoji)
          .font(.system(size: 14))
      } minimal: {
        Text("\(context.state.caloriesConsumed)")
          .font(.system(size: 11, weight: .semibold))
          .foregroundColor(.macroCalories)
      }
      .keylineTint(.macroCalories)
    }
  }
}

private struct LockScreenView: View {
  let state: FitBadgerMealAttributes.ContentState

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        VStack(alignment: .leading, spacing: 2) {
          Text("Fit Badger")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.white.opacity(0.8))
          HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text("\(state.caloriesConsumed)")
              .font(.system(size: 28, weight: .bold))
              .foregroundColor(.white)
            Text("/ \(state.caloriesGoal) kcal")
              .font(.system(size: 13))
              .foregroundColor(.white.opacity(0.7))
          }
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 2) {
          Text(state.lastMealEmoji)
            .font(.system(size: 30))
          Text("\(state.mealCount) meal\(state.mealCount == 1 ? "" : "s")")
            .font(.system(size: 11))
            .foregroundColor(.white.opacity(0.7))
        }
      }

      GeometryReader { geo in
        ZStack(alignment: .leading) {
          Capsule()
            .fill(Color.white.opacity(0.15))
          Capsule()
            .fill(Color.macroCalories)
            .frame(width: geo.size.width * caloriesProgress)
        }
      }
      .frame(height: 6)

      MacroRowView(state: state)
    }
  }

  private var caloriesProgress: CGFloat {
    guard state.caloriesGoal > 0 else { return 0 }
    return max(0, min(1, CGFloat(state.caloriesConsumed) / CGFloat(state.caloriesGoal)))
  }
}

private struct MacroRowView: View {
  let state: FitBadgerMealAttributes.ContentState

  var body: some View {
    HStack(spacing: 10) {
      MacroCell(label: "Protein", value: state.proteinsGrams, goal: state.proteinsGoal, color: .macroProtein)
      MacroCell(label: "Carbs", value: state.carbsGrams, goal: state.carbsGoal, color: .macroCarbs)
      MacroCell(label: "Fats", value: state.fatsGrams, goal: state.fatsGoal, color: .macroFats)
    }
  }
}

private struct MacroCell: View {
  let label: String
  let value: Int
  let goal: Int
  let color: Color

  var body: some View {
    VStack(alignment: .leading, spacing: 3) {
      HStack(spacing: 3) {
        Text(label)
          .font(.system(size: 10, weight: .bold))
          .foregroundColor(color)
        Text("\(value)/\(goal)g")
          .font(.system(size: 10))
          .foregroundColor(.white.opacity(0.85))
      }
      GeometryReader { geo in
        ZStack(alignment: .leading) {
          Capsule()
            .fill(Color.white.opacity(0.15))
          Capsule()
            .fill(color)
            .frame(width: geo.size.width * progress)
        }
      }
      .frame(height: 6)
    }
    .frame(maxWidth: .infinity)
  }

  private var progress: CGFloat {
    guard goal > 0 else { return 0 }
    return max(0, min(1, CGFloat(value) / CGFloat(goal)))
  }
}
