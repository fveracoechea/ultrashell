import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { Accessor, createComputed } from "ags";
import { readCpuTemp } from "./cpu-temp";
import { CpuStats, getCpuStats, initialCpuStats } from "./cpu-usage";
import { formatBytes, getStorageUsage } from "./storage-usage";
import { Dropdown } from "../../styles/components/Dropdown";

type StatProps = {
  widthRequest?: number;
  icon: string;
  value: number | Accessor<number>;
  title: string | Accessor<string>;
  label?: string | Accessor<string>;
};

function Stat(props: StatProps) {
  const { value, label = "", title, icon, widthRequest = 360 } = props;
  return (
    <box
      hexpand
      spacing={4}
      class="stats"
      halign={Gtk.Align.START}
      orientation={Gtk.Orientation.VERTICAL}
    >
      <box hexpand spacing={24}>
        <label class="title" label={title} hexpand halign={Gtk.Align.START} />
        <label class="label" label={label} halign={Gtk.Align.END} />
      </box>
      <box spacing={16} hexpand>
        <label label={icon} class="icon" />
        <box hexpand valign={Gtk.Align.CENTER}>
          <levelbar
            value={value}
            hexpand
            orientation={Gtk.Orientation.HORIZONTAL}
            widthRequest={widthRequest}
          />
        </box>
      </box>
    </box>
  );
}

const interval = 3000;

export function HardwareStatsDropdown() {
  const cpuTemp = createPoll(0, interval, () => readCpuTemp() / 100);

  const cpuStats = createPoll(
    initialCpuStats,
    interval,
    (prev) => getCpuStats(prev.current),
  );

  const cpuUsage = cpuStats(({ current, previous }) => {
    const totalDiff = current.total - previous.total;
    const idleDiff = current.idle - previous.idle;
    return totalDiff > 0 ? (totalDiff - idleDiff) / totalDiff : 0;
  });

  const memory = createPoll("", interval, [
    "sh",
    "-c",
    `free | awk '/^Mem/ {printf("%.2f\\n", ($3/$2) * 100)}'`,
  ]).as(Number);

  const storage = createPoll(
    { used: 0, total: 0, percentage: 0 },
    interval,
    getStorageUsage,
  );

  return (
    <Dropdown
      icon="󰓅"
      name="Performance"
      widthRequest={380}
      actions={(popover) => (
        <box spacing={8} valign={Gtk.Align.START} halign={Gtk.Align.END}>
          <button
            class="icon-button"
            tooltipText="Open BTop"
            valign={Gtk.Align.START}
            onClicked={() => {
              popover.popdown();
              execAsync("ghostty --class=TUI.float -e btop");
            }}
          >
            <label label="" class="icon" />
          </button>
        </box>
      )}
    >
      {() => (
        <box
          class="stats-wrapper"
          hexpand
          spacing={24}
          orientation={Gtk.Orientation.VERTICAL}
        >
          <Stat
            icon=""
            title="CPU Usage"
            value={cpuUsage}
            label={createComputed(
              [cpuUsage],
              (v) => `${(v * 100).toFixed(0)}%`,
            )}
          />
          <Stat
            icon=""
            title="CPU Temperature"
            value={cpuTemp}
            label={createComputed([cpuTemp], (t) => `${(t * 100).toFixed(0)}󰔄`)}
          />
          <Stat
            icon=""
            title="Memory"
            value={memory((v) => v / 100)}
            label={memory((v) => `${v.toFixed(0)}%`)}
          />
          <Stat
            icon="󰋊"
            title="Storage"
            value={storage((s) => s.percentage / 100)}
            label={createComputed(
              [storage],
              (s) =>
                `${s.percentage}% (${formatBytes(s.used)}/${
                  formatBytes(s.total)
                })`,
            )}
          />
        </box>
      )}
    </Dropdown>
  );
}
