require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');
import { contextBridge, ipcRenderer, shell } from "electron";
import si from "systeminformation";
const { v4: uuidv4 } = require('uuid');


async function getDeviceFingerprint() {
  const system = await si.system();
  const baseboard = await si.baseboard();

  // Pick first available identifier → fallback to random UUID
  return system.serial || baseboard.serial || uuidv4();
}



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

contextBridge.exposeInMainWorld("deviceAPI", {
  getDeviceFingerprint: async () => {
    return await getDeviceFingerprint();
  },
  saveToken: async (token: string) => {
    console.log("[preload] forwarding save-token:", token);
    return await ipcRenderer.invoke('save-token', token);
  },
  getToken: () => ipcRenderer.invoke('get-token')
});

contextBridge.exposeInMainWorld("hmac", {
  sign: (args: { token: string; nonce: string; payload?: any; timestamp?: number }) =>
    ipcRenderer.invoke("hmac-sign", args),
});





contextBridge.exposeInMainWorld("shell", { shell });