import { Gtk } from "ags/gtk4";
import { VolumeDropdown } from "./VolumeDropdown";

export function Volume() {
  return (
    <box>
      <menubutton class="icon-button" halign={Gtk.Align.CENTER}>
        {""}
        <VolumeDropdown />
      </menubutton>
    </box>
  );
}
