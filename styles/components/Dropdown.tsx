import { Accessor, createState, State, With } from "ags";
import { Gtk } from "ags/gtk4";

type DropdownHeaderProps = {
  name: string | Accessor<string>;
  icon: string | Accessor<string>;
  children?: JSX.Element;
};

export function DropdownHeader(props: DropdownHeaderProps) {
  const { name, icon, children } = props;
  return (
    <box spacing={8} class="dropdown-header" hexpand valign={Gtk.Align.START}>
      <box spacing={12} hexpand>
        <label class="dropdown-icon" label={icon} />
        <label class="dropdown-title" label={name} />
      </box>
      {children}
    </box>
  );
}

type DropdownContentProps = {
  name?: string | Accessor<string>;
  icon?: string | Accessor<string>;
  actions?: (popover: Gtk.Popover) => JSX.Element;
  children: (popover: Gtk.Popover) => JSX.Element;
  widthRequest?: number;
  heightRequest?: number;
};

export function Dropdown(props: DropdownContentProps) {
  const { actions, children, name, icon, widthRequest = 450, heightRequest } =
    props;

  const [popover, setPopover] = createState(null) as State<Gtk.Popover | null>;

  return (
    <popover $={(self) => setPopover(self)} class="dropdown">
      <box
        name={name}
        hexpand
        vexpand
        orientation={Gtk.Orientation.VERTICAL}
        class="dropdown-contents"
      >
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          {icon && name && (
            <DropdownHeader icon={icon} name={name}>
              <With value={popover}>
                {(value) => {
                  if (value && actions) return actions(value);
                  return <box />;
                }}
              </With>
            </DropdownHeader>
          )}

          {heightRequest
            ? (
              <scrolledwindow
                hexpand
                vexpand
                heightRequest={heightRequest}
                widthRequest={widthRequest}
              >
                <box hexpand vexpand class="dropdown-body">
                  <With
                    value={popover}
                    children={(value) => {
                      if (value) return children(value);
                      return <box />;
                    }}
                  />
                </box>
              </scrolledwindow>
            )
            : (
              <box
                hexpand
                vexpand
                class="dropdown-body"
                widthRequest={widthRequest}
              >
                <With
                  value={popover}
                  children={(value) => {
                    if (value) return children(value);
                    return <box />;
                  }}
                />
              </box>
            )}
        </box>
      </box>
    </popover>
  );
}
