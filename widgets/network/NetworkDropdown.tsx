import { Accessor, createBinding, createComputed, With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

import AstalNetwork from "gi://AstalNetwork";

import { Dropdown } from "../../styles/components/Dropdown";

export function getNetworkIcon(network: AstalNetwork.Network) {
  return createComputed([createBinding(network, "primary")], (p) => {
    switch (p) {
      case AstalNetwork.Primary.WIRED:
        return "󰈀";
      case AstalNetwork.Primary.WIFI:
        return "󰖩";
      default:
        return "󰤭";
    }
  });
}

function getDeviceState(status: number) {
  switch (status) {
    case AstalNetwork.DeviceState.UNMANAGED:
      return "Unmanaged";
    case AstalNetwork.DeviceState.UNAVAILABLE:
      return "Unavailable";
    case AstalNetwork.DeviceState.DISCONNECTED:
      return "Disconnected";
    case AstalNetwork.DeviceState.PREPARE:
      return "Prepare";
    case AstalNetwork.DeviceState.CONFIG:
      return "Config";
    case AstalNetwork.DeviceState.NEED_AUTH:
      return "Need Auth";
    case AstalNetwork.DeviceState.IP_CONFIG:
      return "Ip Config";
    case AstalNetwork.DeviceState.IP_CHECK:
      return "Ip Check";
    case AstalNetwork.DeviceState.SECONDARIES:
      return "Secondaries";
    case AstalNetwork.DeviceState.ACTIVATED:
      return "Activated";
    case AstalNetwork.DeviceState.DEACTIVATING:
      return "Deactivating";
    case AstalNetwork.DeviceState.FAILED:
      return "Failed";
    default:
      return "Unknown";
  }
}

function getWifiIcon(status: number) {
  switch (status) {
    case AstalNetwork.DeviceState.PREPARE:
    case AstalNetwork.DeviceState.CONFIG:
      return "󱚾";
    case AstalNetwork.DeviceState.NEED_AUTH:
    case AstalNetwork.DeviceState.IP_CONFIG:
    case AstalNetwork.DeviceState.IP_CHECK:
    case AstalNetwork.DeviceState.SECONDARIES:
      return "󱛇";
    case AstalNetwork.DeviceState.DEACTIVATING:
    case AstalNetwork.DeviceState.FAILED:
      return "󱚵";
    case AstalNetwork.DeviceState.ACTIVATED:
      return "󱚽";
    case AstalNetwork.DeviceState.UNMANAGED:
    case AstalNetwork.DeviceState.UNAVAILABLE:
    case AstalNetwork.DeviceState.DISCONNECTED:
    default:
      return "󰖪";
  }
}

type NetStatProps = {
  icon: string | Accessor<string>;
  title: string | Accessor<string>;
  subtitle: string | Accessor<string>;
  label: string | Accessor<string>;
};

function NetStat(props: NetStatProps) {
  const { icon, title, subtitle, label } = props;
  return (
    <box spacing={16} class="net-stat">
      <label class="icon" label={icon} valign={Gtk.Align.START} />
      <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
        <label
          hexpand
          class="title"
          label={title}
          halign={Gtk.Align.START}
          valign={Gtk.Align.START}
        />
        <label
          class="subtitle"
          label={subtitle}
          halign={Gtk.Align.START}
          valign={Gtk.Align.START}
        />
      </box>
      <label class="label" valign={Gtk.Align.START} label={label} />
    </box>
  );
}

export function NetworkDropdown() {
  const network = AstalNetwork.get_default();
  const primarySignal = createBinding(network, "primary");
  const wiredBinding = createBinding(network, "wired");
  const wifiBinding = createBinding(network, "wifi");

  return (
    <Dropdown
      icon="󰀂"
      name="Network"
      widthRequest={380}
      actions={(popover) => (
        <box spacing={8} valign={Gtk.Align.START} halign={Gtk.Align.END}>
          <button
            class="icon-button"
            tooltipText="Open Impala"
            valign={Gtk.Align.START}
            onClicked={() => {
              popover.popdown();
              execAsync("ghostty --class=TUI.float -e impala");
            }}
          >
            <label label="󰒓" class="icon" />
          </button>
        </box>
      )}
    >
      {() => (
        <box
          class="net-content"
          orientation={Gtk.Orientation.VERTICAL}
        >
          <With value={wiredBinding}>
            {(wired) => {
              if (!wired) {
                return (
                  <NetStat
                    icon="󰅛"
                    title="No Wired Ethernet Connected"
                    subtitle="Unavailable"
                    label="N/A"
                  />
                );
              }
              return (
                <NetStat
                  icon="󰈀"
                  title="Wired Ethernet"
                  subtitle={createBinding(wired, "state")(getDeviceState)}
                  label={createBinding(wired, "speed")((s) => `${s} Mbps`)}
                />
              );
            }}
          </With>

          <With value={wifiBinding}>
            {(wifi) => {
              if (!wifi) {
                return (
                  <NetStat
                    icon="󰖪"
                    title="No Wi-Fi connected"
                    subtitle="Unavailable"
                    label=""
                  />
                );
              }
              return (
                <NetStat
                  icon={createBinding(wifi, "state")(getWifiIcon)}
                  subtitle={createBinding(wifi, "state")(getDeviceState)}
                  title={createBinding(
                    wifi,
                    "ssid",
                  )((v) => (v ? `Wi-Fi: ${v}` : "No Wi-Fi Connected"))}
                  label={createBinding(wifi, "strength")((
                    s,
                  ) => (s ? `${s}%` : "N/A"))}
                />
              );
            }}
          </With>
        </box>
      )}
    </Dropdown>
  );
}
