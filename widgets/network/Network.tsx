import { Gtk } from "ags/gtk4";
import AstalNetwork from "gi://AstalNetwork";
import { getNetworkIcon, NetworkDropdown } from "./NetworkDropdown";

export function Network() {
  const icon = getNetworkIcon(AstalNetwork.get_default());
  return (
    <box>
      <menubutton class="icon-button" halign={Gtk.Align.CENTER}>
        <label class="icon" label={icon} />
        <NetworkDropdown />
      </menubutton>
    </box>
  );
}
