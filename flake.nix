{
  description = "My Awesome Desktop Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    ags,
  }: let
    entry = "app.tsx";
    pname = "ultrashell";

    forAllSys = nixpkgs.lib.genAttrs nixpkgs.lib.platforms.all;

    getPackages = system: rec {
      pkgs = import nixpkgs {inherit system;};

      scripts = import ./scripts.nix {inherit pkgs;};

      dependencies = with pkgs; [
        kooha
        grimblast
        hyprpicker
        btop
        impala
        wiremix
        blueberry
        libgtop
        scripts.screenshot
      ];

      astalPackages = with ags.packages.${system}; [
        io
        astal4
        tray
        mpris
        apps
        hyprland
        bluetooth
        network
        wireplumber
        notifd
      ];

      extraPackages =
        astalPackages
        ++ dependencies
        ++ [
          pkgs.libadwaita
          pkgs.libsoup_3
        ];
    };
  in {
    packages = forAllSys (system: let
      inherit (getPackages system) pkgs extraPackages dependencies;
    in {
      default = pkgs.stdenv.mkDerivation {
        name = pname;
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook4
          gobject-introspection
          ags.packages.${system}.default
        ];

        buildInputs = extraPackages ++ [pkgs.gjs];

        installPhase = ''
          runHook preInstall

          mkdir -p $out/bin
          mkdir -p $out/share
          cp -r * $out/share
          ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"

          runHook postInstall
        '';

        # runtime executables
        preFixup = ''
          gappsWrapperArgs+=(
            --prefix PATH : ${pkgs.lib.makeBinPath dependencies}
          )
        '';
      };
    });

    devShells = forAllSys (system: let
      inherit (getPackages system) pkgs extraPackages dependencies;
    in {
      default = pkgs.mkShell {
        buildInputs =
          [
            (ags.packages.${system}.default.override {
              inherit extraPackages;
            })
          ]
          ++ dependencies;
      };
    });
  };
}
