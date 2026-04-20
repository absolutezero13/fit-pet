import ActivityKit
import Foundation
import React

@objc(MealLiveActivity)
class MealLiveActivity: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    if #available(iOS 16.2, *) {
      return ["isSupported": ActivityAuthorizationInfo().areActivitiesEnabled]
    }
    return ["isSupported": false]
  }

  @objc(start:resolver:rejecter:)
  func start(
    _ payload: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 16.2, *) else {
      reject("unsupported", "Live Activities require iOS 16.2+", nil)
      return
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      reject("disabled", "Live Activities are disabled by user", nil)
      return
    }

    if let existing = Activity<FitBadgerMealAttributes>.activities.first {
      let content = Self.makeContent(from: payload)
      Task {
        await existing.update(ActivityContent(state: content, staleDate: nil))
      }
      resolve(existing.id)
      return
    }

    do {
      let attributes = FitBadgerMealAttributes(startedAt: Date())
      let state = Self.makeContent(from: payload)
      let activity = try Activity.request(
        attributes: attributes,
        content: ActivityContent(state: state, staleDate: nil),
        pushType: nil
      )
      resolve(activity.id)
    } catch {
      reject("start_failed", error.localizedDescription, error)
    }
  }

  @objc(update:resolver:rejecter:)
  func update(
    _ payload: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 16.2, *) else {
      reject("unsupported", "Live Activities require iOS 16.2+", nil)
      return
    }

    guard let activity = Activity<FitBadgerMealAttributes>.activities.first else {
      reject("not_running", "No active Live Activity to update", nil)
      return
    }

    let state = Self.makeContent(from: payload)
    Task {
      await activity.update(ActivityContent(state: state, staleDate: nil))
      resolve(activity.id)
    }
  }

  @objc(end:rejecter:)
  func end(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 16.2, *) else {
      resolve(nil)
      return
    }

    Task {
      for activity in Activity<FitBadgerMealAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
      resolve(nil)
    }
  }

  @available(iOS 16.2, *)
  private static func makeContent(from payload: NSDictionary) -> FitBadgerMealAttributes.ContentState {
    let int: (String) -> Int = { key in
      if let n = payload[key] as? NSNumber { return n.intValue }
      if let s = payload[key] as? String, let v = Int(s) { return v }
      return 0
    }
    let str: (String) -> String = { key in
      (payload[key] as? String) ?? ""
    }

    return FitBadgerMealAttributes.ContentState(
      caloriesConsumed: int("caloriesConsumed"),
      caloriesGoal: max(int("caloriesGoal"), 1),
      proteinsGrams: int("proteinsGrams"),
      proteinsGoal: max(int("proteinsGoal"), 1),
      carbsGrams: int("carbsGrams"),
      carbsGoal: max(int("carbsGoal"), 1),
      fatsGrams: int("fatsGrams"),
      fatsGoal: max(int("fatsGoal"), 1),
      lastMealTitle: str("lastMealTitle"),
      lastMealEmoji: str("lastMealEmoji").isEmpty ? "🍽" : str("lastMealEmoji"),
      mealCount: max(int("mealCount"), 0)
    )
  }
}
