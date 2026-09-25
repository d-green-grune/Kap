import CoreGraphics

// Replaces the `CGDisplayStream` check from mac-screen-capture-permissions 1.1.0. `CGDisplayStream` is unavailable in the macOS 27 SDK.
// The permission belongs to the responsible process, so this prints the permission of Kap when Kap runs this binary.
// `CGPreflightScreenCaptureAccess()` does not add Kap to the Screen Recording list in System Settings.
// When access is missing, `CGRequestScreenCaptureAccess()` adds Kap to the list and shows the system prompt the first time.
if CGPreflightScreenCaptureAccess() {
	print(true)
} else {
	print(CGRequestScreenCaptureAccess())
}
