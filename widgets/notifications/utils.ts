import type { Accessor, Setter } from "ags";
import type AstalNotifd from "gi://AstalNotifd";
import GLib from "gi://GLib";

export function notificationHandler(
  notifd: AstalNotifd.Notifd,
  notifications: Accessor<AstalNotifd.Notification[]>,
  setNotifications: Setter<AstalNotifd.Notification[]>,
) {
  const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id);
    if (replaced && notifications.get().some((n) => n.id === id)) {
      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)));
    } else {
      setNotifications((ns) => [notification, ...ns]);
    }
  });

  const resolvedHandler = notifd.connect("resolved", (_, id) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
  });

  return () => {
    notifd.disconnect(notifiedHandler);
    notifd.disconnect(resolvedHandler);
  };
}

export function time(timestamp: number, format = "%I:%M %p"): string {
  return GLib.DateTime.new_from_unix_local(timestamp).format(format) ?? "--";
}
