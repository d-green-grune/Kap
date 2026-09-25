#!/bin/bash
# Builds the native helper binaries from the sources in `native/` and replaces the prebuilt binaries in `node_modules`.
# The prebuilt binaries in these npm packages are x86_64 only. They do not run on Apple silicon without Rosetta,
# and Rosetta is not installed by default on macOS 27.
set -euo pipefail

if [[ "$(uname)" != "Darwin" ]]; then
	echo "Skipping the native helpers: they build only on macOS."
	exit 0
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
native="$root/native"
modules="$root/node_modules"

# Arguments: the package directory in `native/`, the executable product name, the destination in `node_modules/`
build() {
	local package="$1"
	local product="$2"
	local destination="$modules/$3"

	if [[ ! -d "$(dirname "$destination")" ]]; then
		echo "Skipping $package: $(dirname "$destination") does not exist."
		return
	fi

	echo "Building $package"
	swift build --configuration release --package-path "$native/$package"
	rm -f "$destination"
	cp "$native/$package/.build/release/$product" "$destination"
	chmod +x "$destination"
}

build mac-windows mac-windows mac-windows/scripts/MacWindows
build activate-window activate-window mac-windows/scripts/ActivateWindow
build get-app-icon GetAppIcon node-mac-app-icon/run
build open-with open-with mac-open-with/open-with
build audio-devices audio-devices macos-audio-devices/audio-devices
build screen-capture-permissions screen-capture-permissions mac-screen-capture-permissions/screen-capture-permissions
