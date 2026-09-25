import {ShareServiceContext} from '../service-context';
import path from 'path';
import {getFormatExtension} from '../../common/constants';
import {Format} from '../../common/types';

const {getAppsThatOpenExtension, openFileWithApp} = require('mac-open-with');

const action = async (context: ShareServiceContext & {appUrl: string}) => {
  const filePath = await context.filePath();
  openFileWithApp(filePath, context.appUrl);
};

export interface App {
  url: string;
  isDefault: boolean;
  icon: string;
  name: string;
}

const openWithFormats = ['mp4', 'gif', 'apng', 'webm', 'av1', 'hevc'] as Format[];

const sortApps = (apps: App[]) => apps
  .map(app => ({...app, name: decodeURI(path.parse(app.url).name)}))
  .filter(app => !['Kap', 'Kap Beta'].includes(app.name))
  .sort((a, b) => {
    if (a.isDefault !== b.isDefault) {
      return Number(b.isDefault) - Number(a.isDefault);
    }

    return Number(b.name === 'Gifski') - Number(a.name === 'Gifski');
  });

const toAppsMap = (entries: Array<[Format, App[]]>) => new Map(entries.filter(([, apps]) => apps.length > 0));

// Listing the apps runs the `open-with` helper once for each format, which takes about a second in total.
// The list is loaded on first use instead of when the plugin loads, so that it does not delay the launch.
let appsForFormat: Map<Format, App[]> | undefined;

export const getApps = () => {
  appsForFormat ??= toAppsMap(openWithFormats.map(format => [
    format,
    sortApps(getAppsThatOpenExtension.sync(getFormatExtension(format)) as App[])
  ]));

  return appsForFormat;
};

// Loads the list without blocking the main process, so that the editor does not wait for it later
export const preloadApps = async () => {
  if (appsForFormat) {
    return;
  }

  try {
    const entries = await Promise.all(openWithFormats.map(async (format): Promise<[Format, App[]]> => [
      format,
      sortApps(await getAppsThatOpenExtension(getFormatExtension(format)) as App[])
    ]));

    appsForFormat ??= toAppsMap(entries);
  } catch {
    // `getApps()` loads the list again when the editor needs it
  }
};

export const shareServices = [{
  title: 'Open With',
  get formats() {
    return [...getApps().keys()];
  },
  action
}];
