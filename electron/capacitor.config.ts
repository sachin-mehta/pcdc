import { CapacitorConfig } from '@capacitor/cli';

interface ExtendedCapacitorConfig extends CapacitorConfig {
  electron?: {
    trayIconAndMenuEnabled?: boolean;
    electronIsDev?: boolean;
  };
}

const config: ExtendedCapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'unicef-pdca',
  webDir: 'www',
  bundledWebRuntime: false,
  electron: {
    trayIconAndMenuEnabled: true,
    electronIsDev: true
  }
};

export default config;
