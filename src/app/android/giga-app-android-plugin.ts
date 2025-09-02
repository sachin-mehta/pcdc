import { registerPlugin } from '@capacitor/core';

export interface GigaAppPluginType {
  getHistoricalSpeedTestData(): Promise<{ historicalData: any }>;
}

export const GigaAppPlugin = registerPlugin<GigaAppPluginType>('GigaAppPlugin');
