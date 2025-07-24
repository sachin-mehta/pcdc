require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');
import { contextBridge, ipcRenderer, shell } from "electron";   

// Safe wrapper for ipcRenderer instead of exposing the entire object
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func);
  }
});

contextBridge.exposeInMainWorld("shell", {shell});