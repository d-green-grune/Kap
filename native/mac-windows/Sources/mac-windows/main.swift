import Quartz

struct Window {
  var pid = 0
  var ownerName = ""
  var name = ""
  var x = 0
  var y = 0
  var width = 0
  var height = 0
  var number = 0

  func convertToDictionary() -> [String : Any] {
    return ["pid": self.pid, "ownerName": self.ownerName, "name": self.name, "x": self.x, "y": self.y, "width": self.width, "height": self.height, "number": self.number]
  }
}

func getWindows(onScreenOnly: Bool) -> [Window] {
  var windows: [Window] = []

  var options = CGWindowListOption(arrayLiteral: CGWindowListOption.excludeDesktopElements)
  if onScreenOnly {
    options = CGWindowListOption(arrayLiteral: CGWindowListOption.excludeDesktopElements, CGWindowListOption.optionOnScreenOnly)
  }

  let windowList = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as! NSArray

  for window in windowList {
    let dict = (window as! NSDictionary)

    let minWinSize: Int = 50

    if ((dict.value(forKey: "kCGWindowAlpha") as! Double) == 0) {
      continue;
    }

    let bounds = dict.value(forKey: "kCGWindowBounds") as! NSDictionary

    let x = bounds.value(forKey: "X")! as! Int
    let y = bounds.value(forKey: "Y")! as! Int
    let width = bounds.value(forKey: "Width")! as! Int
    let height = bounds.value(forKey: "Height")! as! Int

    if (width < minWinSize || height < minWinSize) {
      continue;
    }

    let pid = dict.value(forKey: "kCGWindowOwnerPID") as! Int

    var ownerName = ""
    if (dict.value(forKey: "kCGWindowOwnerName") != nil) {
      ownerName = dict.value(forKey: "kCGWindowOwnerName") as! String
    }

    var number = 0
    if (dict.value(forKey: "kCGWindowNumber") != nil) {
      number = dict.value(forKey: "kCGWindowNumber") as! Int
    }

    var name = ""
    if (dict.value(forKey: "kCGWindowName") != nil) {
      name = dict.value(forKey: "kCGWindowName") as! String
    }

    windows.append(Window(pid: pid, ownerName: ownerName, name: name, x: x, y: y, width: width, height: height, number: number))
  }

  return windows
}

func toJson(windows: [Window]) -> String {
  do {
    let dicArray = windows.map { $0.convertToDictionary() }
    let jsonData = try JSONSerialization.data(withJSONObject: dicArray, options: .prettyPrinted)
    let json = String(data: jsonData, encoding: String.Encoding.utf8)
    return json!
  } catch {
    return "[]"
  }
}

// Kap reads the app icons for its window menu with `MacWindows --icons <pid>...`, which prints {"<pid>": "<base64 PNG>"}.
// One process reads all icons. Electron's `app.getFileIcon()` returns the generic app icon for every app on macOS.
func pngIcon(pid: Int, size: Int) -> String? {
  guard
    let icon = NSRunningApplication(processIdentifier: pid_t(pid))?.icon,
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)
  else {
    return nil
  }

  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
  icon.draw(in: NSRect(x: 0, y: 0, width: size, height: size), from: .zero, operation: .copy, fraction: 1)
  NSGraphicsContext.restoreGraphicsState()

  return bitmap.representation(using: .png, properties: [:])?.base64EncodedString()
}

if CommandLine.arguments.count > 1 && CommandLine.arguments[1] == "--icons" {
  var icons: [String: String] = [:]
  for argument in CommandLine.arguments.dropFirst(2) {
    if let pid = Int(argument), let icon = pngIcon(pid: pid, size: 32) {
      icons[argument] = icon
    }
  }

  let data = try! JSONSerialization.data(withJSONObject: icons)
  print(String(data: data, encoding: .utf8)!)
  exit(0)
}

let onScreenOnly = Bool(CommandLine.arguments[1])!
let windows = getWindows(onScreenOnly: onScreenOnly);
let json = toJson(windows: windows);

print(json);
