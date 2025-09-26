import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import type { BrowserWindow } from '@electron/remote';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  readonly ipcRenderer: typeof ipcRenderer;
  readonly webFrame: typeof webFrame;
  readonly remote: any; // Using any for now to avoid type issues

  constructor() {
    if (this.isElectron) {
      const electron = window.require('electron');
      this.ipcRenderer = electron.ipcRenderer;
      this.webFrame = electron.webFrame;
      this.remote = window.require('@electron/remote');
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
} 