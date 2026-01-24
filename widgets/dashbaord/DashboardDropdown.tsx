import { Gtk } from "ags/gtk4";
import { Dropdown } from "../../styles/components/Dropdown";
import { fileExists, normalizeToAbsolutePath } from "../../utils/file";
import { execAsync } from "ags/process";

const SystemActions = {
  Shutdown: {
    icon: "󰐥",
    action() {
      execAsync("systemctl poweroff").catch((e) => console.log(e));
    },
  },
  Restart: {
    icon: "󰜉",
    action() {
      execAsync("systemctl reboot").catch((e) => console.log(e));
    },
  },
  Logout: {
    icon: "󰍃",
    action() {
      execAsync("hyprctl dispatch exit").catch((e) => console.log(e));
    },
  },
  Sleep: {
    icon: "󰤄",
    action() {
      execAsync("systemctl suspend").catch((e) => console.log(e));
    },
  },
} as const;

type SystemActionProps = {
  type: keyof (typeof SystemActions);
};

function SystemActionBtn(props: SystemActionProps) {
  const { type } = props;
  const { action, icon } = SystemActions[type];
  return (
    <button
      class={type}
      onClicked={action}
    >
      <box hexpand orientation={Gtk.Orientation.VERTICAL}>
        <label
          class="icon"
          label={icon}
          halign={Gtk.Align.CENTER}
        />
        <label
          hexpand
          class="label"
          label={type}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        />
      </box>
    </button>
  );
}

const UtilsActions = {
  "Search Apps": {
    icon: "",
    action() {
      // TODO: Implement app search
      // execAsync("hyprpicker --autocopy").catch((e) => console.log(e));
    },
  },
  "Color Picker": {
    icon: "",
    action() {
      execAsync("hyprpicker --autocopy").catch((e) => console.log(e));
    },
  },
  "Screen Recorder": {
    icon: "",
    action() {
      execAsync("kooha").catch((e) => console.log(e));
    },
  },
  Screenshot: {
    icon: "󰹑",
    action() {
      execAsync("ultrashell-screenshot").catch((e) => console.log(e));
    },
  },
} as const;

type UtilsActionProps = {
  type: keyof (typeof UtilsActions);
  onClicked?: () => void;
};

function UtilsActionBtn(props: UtilsActionProps) {
  const { type, onClicked } = props;
  const { action, icon } = UtilsActions[type];
  return (
    <button
      class={type}
      onClicked={() => {
        if (onClicked) onClicked();
        action();
      }}
    >
      <box hexpand spacing={16}>
        <label
          class="icon"
          label={icon}
          halign={Gtk.Align.START}
        />
        <label
          hexpand
          class="label"
          label={type}
          halign={Gtk.Align.START}
          valign={Gtk.Align.CENTER}
        />
      </box>
    </button>
  );
}

export function DashboardDropdown() {
  const image = normalizeToAbsolutePath("~/.face.icon");
  return (
    <Dropdown>
      {(popover) => {
        return (
          <box
            class="dashboard-dropdown"
            spacing={16}
            hexpand
            orientation={Gtk.Orientation.VERTICAL}
          >
            <box hexpand spacing={16}>
              {fileExists(image) && (
                <box class="profile">
                  <box
                    class="face"
                    widthRequest={175}
                    heightRequest={175}
                    css={`background-image: url("file://${image}");`}
                  />
                </box>
              )}
              <box
                hexpand
                vexpand
                spacing={4}
                class="utils"
                orientation={Gtk.Orientation.VERTICAL}
              >
                <UtilsActionBtn
                  type="Search Apps"
                  onClicked={() => popover.popdown()}
                />
                <UtilsActionBtn
                  type="Color Picker"
                  onClicked={() => popover.popdown()}
                />
                <UtilsActionBtn
                  type="Screen Recorder"
                  onClicked={() => popover.popdown()}
                />
                <UtilsActionBtn
                  type="Screenshot"
                  onClicked={() => popover.popdown()}
                />
              </box>
            </box>
            <box
              hexpand
              spacing={4}
              class="system-actions"
            >
              <SystemActionBtn type="Sleep" />
              <SystemActionBtn type="Logout" />
              <SystemActionBtn type="Restart" />
              <SystemActionBtn type="Shutdown" />
            </box>
          </box>
        );
      }}
    </Dropdown>
  );
}
