import AstalNotifd from "gi://AstalNotifd";
import { Dropdown } from "../../styles/components/Dropdown";
import { Gtk } from "ags/gtk4";
import { createBinding, createComputed, createState, For } from "ags";
import { notificationHandler } from "./utils";
import { NotificationCard } from "./NotificationCard";
import { createPoll } from "ags/time";
import { logObject } from "../../utils/log";

const notifd = AstalNotifd.get_default();

export const [notifications, setNotifications] = createState(
  [] as AstalNotifd.Notification[],
);

setNotifications(notifd.notifications);
notificationHandler(notifd, notifications, setNotifications);

export const dontDisturb = createBinding(notifd, "dont_disturb").as((v) => !v);

export const notificationIcon = createComputed(
  [dontDisturb, notifications],
  (enable, nts) => {
    const hasNotifications = nts.length > 0;
    if (enable && hasNotifications) {
      return "󱅫";
    }
    if (enable && !hasNotifications) {
      return "󰂚";
    }
    return "󰂛";
  },
);

export function NotificationsDropdown() {
  return (
    <Dropdown
      icon={notificationIcon}
      name={notifications((nts) => `${nts.length} Notifications`)}
      heightRequest={550}
      widthRequest={500}
      actions={() => (
        <box spacing={8} valign={Gtk.Align.START} halign={Gtk.Align.END}>
          <box valign={Gtk.Align.START} halign={Gtk.Align.END}>
            <switch
              active={dontDisturb}
              heightRequest={4}
              valign={Gtk.Align.CENTER}
              $={(self) => {
                self.connect("notify::active", () => {
                  notifd.set_dont_disturb(!self.active);
                });
              }}
            />
          </box>
          <button
            class="icon-button"
            valign={Gtk.Align.START}
            tooltipText="Clear All Notifications"
            visible={notifications((n) =>
              n.length > 0
            )}
            onClicked={() => {
              const nts = notifications.get();
              nts.forEach((n) =>
                n.dismiss()
              );
            }}
          >
            <label label="󰩹" class="icon" />
          </button>
        </box>
      )}
    >
      {(popover) => (
        <box
          hexpand
          spacing={8}
          class="notifications-content"
          orientation={Gtk.Orientation.VERTICAL}
        >
          <For
            each={notifications((n) => [...n].sort((a, b) => b.time - b.time))}
          >
            {(n: AstalNotifd.Notification) => {
              return <NotificationCard data={n} popover={popover} />;
            }}
          </For>

          <box
            class="no-notifications"
            visible={notifications((n) => n.length < 1)}
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            vexpand
            hexpand
          >
            <label class="icon" label="󰂜" />
            <label class="label" label="You're all caught up!" />
          </box>
        </box>
      )}
    </Dropdown>
  );
}
