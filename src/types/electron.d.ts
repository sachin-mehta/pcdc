import type { BrowserWindow, webContents } from '@electron/remote';

declare global {
  interface Window {
    require: any;
    process: any;
    __dirname: string;
  }
}

declare module 'electron' {
  interface CrossProcessExports {
    remote: any; // Using any here to avoid conflicts
  }
}

// Ensure this file is treated as a module
export {}; 