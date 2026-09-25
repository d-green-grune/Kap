import {app, Menu, MenuItem} from 'electron';
import Store from 'electron-store';
import delay from 'delay';
import {windowManager} from '../windows/manager';

const {getWindows, activateWindow} = require('mac-windows');

export interface MacWindow {
  pid: number;
  ownerName: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  number: number;
  path?: string;
}

const APP_BLACKLIST = [
  'Kap',
  'Kap Beta',
  // Stage Manager overlays in the side strip
  'WindowManager'
];

const store = new Store<{
  appUsageHistory: Record<number, {
    count: number;
    lastUsed: number;
  } | undefined>;
}>({
  name: 'usage-history'
});

const usageHistory = store.get('appUsageHistory', {});

const isValidApp = ({ownerName}: MacWindow) => !APP_BLACKLIST.includes(ownerName);

// Reads the icon in this process. Starting a helper process for each app blocked the main process for up to a second.
const getAppIcon = async (window: MacWindow) => {
  if (!window.path) {
    return undefined;
  }

  try {
    return await app.getFileIcon(window.path, {size: 'small'});
  } catch {
    return undefined;
  }
};

const getWindowList = async () => {
  const windows = (await getWindows() as MacWindow[]).filter(window => isValidApp(window));
  const icons = await Promise.all(windows.map(async window => getAppIcon(window)));

  let maxLastUsed = 0;

  return windows.map((win, index) => {
    const window = {
      ...win,
      icon: icons[index],
      count: 0,
      lastUsed: 0,
      ...usageHistory[win.pid]
    };

    maxLastUsed = Math.max(maxLastUsed, window.lastUsed);
    return window;
  }).sort((a, b) => {
    if (a.lastUsed === maxLastUsed) {
      return -1;
    }

    if (b.lastUsed === maxLastUsed) {
      return 1;
    }

    return b.count - a.count;
  });
};

const hasSameFrame = (a: MacWindow, b: MacWindow) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

// With Stage Manager enabled, the window list reports the windows in the side strip at the frame of their thumbnail.
// Activating the app moves its window to the stage, so read the frame again until it stops changing.
export const getSettledWindowFrame = async (window: MacWindow) => {
  let previous: MacWindow | undefined;

  for (let attempt = 0; attempt < 10; attempt++) {
    const windows = await getWindows({showAllWindows: true}) as MacWindow[];
    const current = windows.find(win => win.number === window.number);

    if (!current) {
      return previous ?? window;
    }

    if (previous && hasSameFrame(previous, current)) {
      return current;
    }

    previous = current;
    await delay(150);
  }

  return previous ?? window;
};

export const buildWindowsMenu = async (selected: string) => {
  const menu = new Menu();
  const windows = await getWindowList();

  for (const win of windows) {
    menu.append(
      new MenuItem({
        label: win.ownerName,
        icon: win.icon,
        type: 'checkbox',
        checked: win.ownerName === selected,
        click: () => {
          activateApp(win);
        }
      })
    );
  }

  return menu;
};

const updateAppUsageHistory = (app: MacWindow) => {
  const {count = 0} = usageHistory[app.pid] ?? {};

  usageHistory[app.pid] = {
    count: count + 1,
    lastUsed: Date.now()
  };

  store.set('appUsageHistory', usageHistory);
};

export const activateApp = (window: MacWindow) => {
  updateAppUsageHistory(window);
  windowManager.cropper?.selectApp(window, activateWindow);
};
