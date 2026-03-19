import { EventEmitter } from "events";

const globalForNotificationBus = globalThis as unknown as {
  notificationBus?: EventEmitter;
};

export const notificationBus =
  globalForNotificationBus.notificationBus ?? new EventEmitter();

if (!globalForNotificationBus.notificationBus) {
  globalForNotificationBus.notificationBus = notificationBus;
}

export function emitNotificationsChanged(userId: string) {
  notificationBus.emit("notifications:changed", { userId });
}

