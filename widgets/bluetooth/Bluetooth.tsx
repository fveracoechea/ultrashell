import AstalBluetooth from "gi://AstalBluetooth";
import { Accessor, createBinding, With } from "ags";
import { Gtk } from "ags/gtk4";
import { BluetoothDropdown } from "./BluetoothDropdown";

export function Bluetooth() {
  const bluetooth = AstalBluetooth.get_default();
  const devicesSignal = createBinding(bluetooth, "devices");
  const isConnectedSignal = createBinding(bluetooth, "is_connected");
  const iconSignal = isConnectedSignal.as((v) => (v ? "󰂯" : "󰂲"));

  return (
    <box>
      <menubutton class="icon-button" halign={Gtk.Align.CENTER}>
        <With value={iconSignal}>{(icon) => <label label={icon} />}</With>
        <BluetoothDropdown />
      </menubutton>
    </box>
  );
}
