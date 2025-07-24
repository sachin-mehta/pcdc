declare module 'ngx-electron' {
  import { BrowserWindow, webContents } from '@electron/remote';
  import { ModuleWithProviders, NgModule } from '@angular/core';
  
  export class ElectronService {
    private _electron: any;
    private readonly electron: any;
    readonly isElectronApp: boolean;
    readonly isMacOS: boolean;
    readonly isWindows: boolean;
    readonly isLinux: boolean;
    readonly isX86: boolean;
    readonly isX64: boolean;
    readonly isArm: boolean;
    readonly desktopCapturer: Electron.DesktopCapturer;
    readonly ipcRenderer: Electron.IpcRenderer;
    readonly remote: any; // Using any to avoid type conflicts
    readonly webFrame: Electron.WebFrame;
    readonly clipboard: Electron.Clipboard;
    readonly crashReporter: Electron.CrashReporter;
    readonly process: any;
    readonly nativeImage: typeof Electron.nativeImage;
    readonly screen: Electron.Screen;
    readonly shell: Electron.Shell;
  }

  @NgModule({})
  export class NgxElectronModule {
    static forRoot(): ModuleWithProviders<NgxElectronModule>;
  }
} 