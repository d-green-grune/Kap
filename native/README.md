# Native helpers

These are the sources of the helper binaries that some npm dependencies run. The binaries published to npm are x86_64 only. On Apple silicon they need Rosetta, and Rosetta is not installed by default on macOS 27. `scripts/build-native-helpers.sh` runs on `yarn install`, builds each helper for the architecture of the build machine, and replaces the binary in `node_modules`.

| Directory | Replaces | Source |
| --- | --- | --- |
| `mac-windows` | `node_modules/mac-windows/scripts/MacWindows` | [karaggeorge/mac-windows](https://github.com/karaggeorge/mac-windows) 1.0.0 (MIT) |
| `activate-window` | `node_modules/mac-windows/scripts/ActivateWindow` | [karaggeorge/mac-windows](https://github.com/karaggeorge/mac-windows) 1.0.0 (MIT) |
| `open-with` | `node_modules/mac-open-with/open-with` | [karaggeorge/mac-open-with](https://github.com/karaggeorge/mac-open-with) 1.2.3 (MIT) |
| `audio-devices` | `node_modules/macos-audio-devices/audio-devices` | [karaggeorge/macos-audio-devices](https://github.com/karaggeorge/macos-audio-devices) (MIT) |
| `screen-capture-permissions` | `node_modules/mac-screen-capture-permissions/screen-capture-permissions` | New. The 1.1.0 source uses `CGDisplayStream`, which is unavailable in the macOS 27 SDK. This version uses `CGPreflightScreenCaptureAccess()`, and calls `CGRequestScreenCaptureAccess()` when access is missing so that Kap appears in the Screen Recording list. |

The build needs Xcode or the Xcode command line tools. `audio-devices` fetches its Swift package dependency from GitHub on the first build.
