import {
  Accessor,
  createBinding,
  createComputed,
  createEffect,
  createState,
  For,
  With,
} from "ags";
import { Gtk } from "ags/gtk4";

import { Dropdown } from "../../styles/components/Dropdown";

import Mpris from "gi://AstalMpris";
import { MediaPlayer } from "./MediaPlayer";
import { execAsync } from "ags/process";
import { VolumeSliders } from "./VolumeSliders";

function MediaTabs() {
  const Media = Mpris.get_default();
  const players = createBinding(Media, "players").as((p) => p ?? []);

  const hasPlayers = players((p) => p.length > 0);

  const [activePlayer, setActivePlayer] = createState(
    Media.players.at(0)?.identity ?? null,
  );

  createEffect(() => {
    const current = activePlayer();
    const allPlayers = players();
    const isPlayerInList = allPlayers.some((p) => p.identity === current);
    const first = allPlayers.at(0)?.identity ?? null;
    if (!isPlayerInList && first) {
      setActivePlayer(first);
    }
  });

  const stackClassNames = createComputed(
    () => {
      const first = players().at(0)?.identity ?? null;
      return first === activePlayer() ? "" : "rounded-top-left";
    },
  );

  return (
    <box
      class="tabs"
      visible={hasPlayers}
      orientation={Gtk.Orientation.VERTICAL}
    >
      <box>
        <For each={players}>
          {(player: Mpris.Player) => (
            <button
              onClicked={() => setActivePlayer(player.identity)}
              class={activePlayer.as((p) =>
                p === player.identity ? "tab active" : "tab"
              )}
            >
              {player.identity}
            </button>
          )}
        </For>
      </box>
      <With value={activePlayer}>
        {(playerId) => {
          if (!playerId) return null;
          return (
            <stack
              class={stackClassNames}
              visibleChildName={playerId}
              transitionDuration={250}
              transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
            >
              <For each={players}>
                {(player: Mpris.Player) => <MediaPlayer player={player} />}
              </For>
            </stack>
          );
        }}
      </With>
    </box>
  );
}

export function VolumeDropdown() {
  return (
    <Dropdown
      icon=""
      name="Volume"
      actions={(popover) => (
        <box spacing={8} valign={Gtk.Align.START} halign={Gtk.Align.END}>
          <button
            class="icon-button"
            tooltipText="Open Wiremix"
            valign={Gtk.Align.START}
            onClicked={() => {
              popover.popdown();
              execAsync("ghostty --class=TUI.float -e wiremix");
            }}
          >
            <label label="󰒓" class="icon" />
          </button>
        </box>
      )}
    >
      {() => (
        <box hexpand orientation={Gtk.Orientation.VERTICAL} spacing={16}>
          <VolumeSliders />
          <MediaTabs />
        </box>
      )}
    </Dropdown>
  );
}
