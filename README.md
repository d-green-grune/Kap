<p align="center">
  <img src="https://getkap.co/static/favicon/kap.svg" height="64">
  <h3 align="center">Kap</h3>
  <p align="center">An open-source screen recorder built with web technology<p>
  <p align="center"><a href="https://circleci.com/gh/wulkano/kap"><img src="https://circleci.com/gh/wulkano/Kap.svg?style=shield" alt="Build Status"></a> <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="XO code style"></a></p>
</p>

## About this fork

This fork of Kap 3.6.0 runs on macOS 27 on Apple silicon. Upstream Kap is not maintained.

### Changes from upstream

- **Native helper binaries.** Several dependencies (`mac-windows`, `mac-open-with`, `macos-audio-devices`, `mac-screen-capture-permissions`) ship x86_64-only binaries. Without Rosetta they fail with `spawn Unknown system error -86`, and Kap cannot open the recorder. The sources are in [`native/`](native/README.md), and `yarn install` builds them for the build machine.
- **Screen Recording permission.** The permission check uses `CGPreflightScreenCaptureAccess()` and `CGRequestScreenCaptureAccess()`. The old check used `CGDisplayStream`, which is unavailable in the macOS 27 SDK.
- **gifsicle 5.3.0.** This version includes an arm64 binary.
- **Stage Manager alignment.** With Stage Manager enabled, macOS moved the cropper window 16–20 px down, so recordings were offset from the selection. The cropper now stays on the display bounds. When you select an app from the side strip, Kap reads the window frame again after the app moves to the stage.
- **arm64 only.** macOS 27 does not run on Intel Macs, and `ffmpeg-static` downloads the binary for the build machine only.
- **No update checks.** The update checker is removed, so an upstream release cannot replace this build.

### Build and install

Requirements: macOS on Apple silicon, Xcode, and Node.js 16 with Yarn 1 (for example through [Volta](https://volta.sh)).

```sh
volta run --node 16 --yarn 1 yarn install
volta run --node 16 --yarn 1 yarn run pack
```

Use `yarn run pack`. `yarn pack` is a Yarn command that writes a tarball.

The app is written to `dist/mac-arm64/Kap.app`. Quit Kap, and then copy the app to `/Applications`. Kap must be in `/Applications` to start.

To choose the signing identity, set `CSC_NAME`. If the Apple timestamp service is not available, turn off the timestamp for a local build:

```sh
CSC_NAME="Your Name (TEAMID)" volta run --node 16 --yarn 1 yarn electron-builder --dir -c.mac.timestamp=none
```

### After you install a new build

- A new signature needs a new Screen Recording permission. In System Settings → Privacy & Security → Screen & System Audio Recording, remove the old Kap entry, open Kap, and turn on Kap in the list. Then quit and open Kap again.
- Plugins are installed from npm into `~/Library/Application Support/Kap/plugins` and are not changed by this fork. Plugins that include x86_64-only binaries fail with error -86 unless Rosetta is installed. For example, `kap-do-not-disturb`, `kap-hide-desktop-icons`, and `kap-key-cast` fail.

[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

## Get Kap

Download the latest release:

- [Apple silicon](https://getkap.co/api/download/arm64)
- [Intel](https://getkap.co/api/download/x64)

Or install with [Homebrew-Cask](https://caskroom.github.io):

```sh
brew install --cask kap
```

## How To Use Kap

Click the menu bar icon to bring up the screen recorder. After selecting what portion of the screen you'd like to record, hit the record button to start recording. Click the menu bar icon again to stop the recording.

> Tip: While recording, Option-click the menu bar icon to pause or right-click for more options.

## Contribute

Read the [contribution guide](contributing.md).

## Plugins

For more info on how to create plugins, read the [plugins docs](docs/plugins.md).

## Dev builds

Download [`main`](https://kap-artifacts.now.sh/main) or builds for any other branch using: `https://kap-artifacts.now.sh/<branch>`. Note that these builds are unsupported and may have issues.

## Related Repositories

- [Website](https://github.com/wulkano/kap-website)
- [Aperture](https://github.com/wulkano/aperture)

## Newsletter

[Subscribe](http://eepurl.com/ch90_1)

## Thanks

- [▲ Vercel](https://vercel.com/) for fast deployments served from the edge, hosting our website, downloads, and updates.
- [● CircleCI](https://circleci.com/) for supporting the open source community and making our builds fast and reliable.
- [△ Sentry](https://sentry.io/) for letting us know when Kap isn't behaving and helping us eradicate said behaviour.
- Our [contributors](https://github.com/wulkano/kap/contributors) who help maintain Kap and make screen recording and sharing easy.
