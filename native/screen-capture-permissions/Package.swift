// swift-tools-version:5.5
import PackageDescription

let package = Package(
	name: "screen-capture-permissions",
	platforms: [
		.macOS(.v12)
	],
	targets: [
		.target(
			name: "screen-capture-permissions"
		)
	]
)
