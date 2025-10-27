import { CapacitorConfig } from '@capacitor/cli';
import { environment } from './src/environments/environment';

interface ExtendedCapacitorConfig extends CapacitorConfig {
  electron?: {
    trayIconAndMenuEnabled?: boolean;
    electronIsDev?: boolean;
  };
}

const config: ExtendedCapacitorConfig = {
  appId: 'com.meter.giga',
  appName: 'unicef-pdca',
  webDir: 'www',
  electron: {
    trayIconAndMenuEnabled: true,
    electronIsDev: false,
  },
};

export default config;
