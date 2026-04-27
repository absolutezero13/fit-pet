import PubSub from "pubsub-js";

export class EventBus<TEvents extends Record<string, unknown>> {
  subscribe<K extends keyof TEvents & string>(
    event: K,
    handler: (payload: TEvents[K]) => void,
  ): () => void {
    const token = PubSub.subscribe(
      event,
      (_msg: string, data: TEvents[K]) => {
        handler(data);
      },
    );
    return () => {
      PubSub.unsubscribe(token);
    };
  }

  publish<K extends keyof TEvents & string>(
    event: K,
    payload: TEvents[K],
  ): void {
    PubSub.publish(event, payload);
  }
}

export enum AppEvent {
  MealChanged = "meal:changed",
  LanguageChanged = "language:changed",
  EditMealRequested = "meal:edit-requested",
}

type AppEvents = {
  [AppEvent.MealChanged]: { date?: string };
  [AppEvent.LanguageChanged]: { code: string };
  [AppEvent.EditMealRequested]: { mealId: string; date: string };
};

export const eventBus = new EventBus<AppEvents>();
