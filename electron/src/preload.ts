require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');
import { contextBridge, ipcRenderer, shell } from 'electron';

// Safe wrapper for ipcRenderer instead of exposing the entire object
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  invoke: (channel: string, ...args: any[]) =>
    ipcRenderer.invoke(channel, ...args),
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func);
  },
});

contextBridge.exposeInMainWorld('shell', { shell });

// Expose hardware ID API
contextBridge.exposeInMainWorld('electronAPI', {
  getWifiList: () => ipcRenderer.invoke('get-wifi-list'),
  getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
  onHardwareId: (callback: (data: any) => void) => {
    ipcRenderer.on('system-hardware-id', (event, data) => callback(data));
  },
});
