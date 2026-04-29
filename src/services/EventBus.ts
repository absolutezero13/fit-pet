import PubSub from "pubsub-js";

class EventBus<TEvents extends Record<string, unknown>> {
  subscribe<K extends keyof TEvents & string>(
    event: K,
    handler: (payload: TEvents[K]) => void,
  ): () => void {
    const token = PubSub.subscribe(event, (_msg: string, data: TEvents[K]) => {
      handler(data);
    });
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
  MealUpdated = "meal:updated",
  LanguageChanged = "language:changed",
}

type AppEvents = {
  [AppEvent.MealChanged]: { date?: string };
  [AppEvent.MealUpdated]: { id?: string };
  [AppEvent.LanguageChanged]: { code: string };
};

export const eventBus = new EventBus<AppEvents>();
