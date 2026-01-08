// Provide a lightweight augmentation for Electron types so older libs
// referencing `Electron.Remote` / `Electron.CrossProcessExports.Remote`
// compile correctly against newer Electron type definitions.

declare global {
  namespace Electron {
    interface Remote {
      [key: string]: any;
    }
    namespace CrossProcessExports {
      interface Remote {
        [key: string]: any;
      }
    }
  }
}

export {};
