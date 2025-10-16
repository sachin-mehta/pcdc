import type { BrowserWindow, webContents } from '@electron/remote';

interface HardwareData {
  hardwareId: string;
  uuid: string;
  serial: string;
  sku: string;
  manufacturer: string;
  model: string;
  osSerial: string;
  timestamp: string;
}

declare global {
  interface Window {
    require: any;
    process: any;
    __dirname: string;
    electronAPI?: {
      getHardwareId: () => Promise<HardwareData>;
      onHardwareId: (callback: (data: HardwareData) => void) => void;
    };
  }
}

declare module 'electron' {
  interface CrossProcessExports {
    remote: any; // Using any here to avoid conflicts
  }
}

// Ensure this file is treated as a module
export {}; 