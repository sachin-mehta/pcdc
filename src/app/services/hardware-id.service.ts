import { Injectable } from '@angular/core';

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

interface HardwareError {
  error: string;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class HardwareIdService {
  private readonly STORAGE_KEY = 'system_hardware_id';
  private hardwareIdPromise: Promise<HardwareData | null> | null = null;
  private hardwareIdResolve: ((data: HardwareData | null) => void) | null =
    null;
  private hardwareIdReject: ((error: any) => void) | null = null;

  constructor() {
    this.initializeHardwareId();
  }

  /**
   * Initialize hardware ID listener when running in Electron
   */
  private initializeHardwareId(): void {
    if (this.isElectron()) {
      console.log('🔧 [HardwareID] Initializing hardware ID service...');

      // Listen for hardware ID success from main process
      this.getElectronAPI()?.onHardwareId((data: HardwareData) => {
        console.log(
          '✅ [HardwareID] Received hardware ID from Electron:',
          data.hardwareId
        );
        this.saveHardwareData(data);

        // Resolve any pending promises
        if (this.hardwareIdResolve) {
          this.hardwareIdResolve(data);
          this.hardwareIdResolve = null;
          this.hardwareIdReject = null;
        }
      });

      // Listen for hardware ID errors from main process
      this.getElectronAPI()?.onHardwareIdError((error: HardwareError) => {
        console.error(
          '❌ [HardwareID] Hardware ID error from Electron:',
          error
        );

        // Reject any pending promises
        if (this.hardwareIdReject) {
          this.hardwareIdReject(error);
          this.hardwareIdResolve = null;
          this.hardwareIdReject = null;
        }
      });

      // Also try to fetch it immediately via IPC
      this.fetchHardwareId();
    } else {
      console.warn(
        '⚠️ [HardwareID] Not running in Electron, hardware ID not available'
      );
    }
  }

  /**
   * Fetch hardware ID from Electron main process via IPC
   */
  async fetchHardwareId(): Promise<HardwareData | null> {
    if (!this.isElectron()) {
      console.warn(
        '⚠️ [HardwareID] Not running in Electron, hardware ID not available'
      );
      return null;
    }

    try {
      console.log('📤 [HardwareID] Requesting hardware ID via IPC...');
      const data = await this.getElectronAPI()?.getHardwareId();

      if (data && data.error) {
        console.error(
          '❌ [HardwareID] IPC returned error:',
          data.error,
          data.message
        );
        return null;
      }

      if (data && data.hardwareId) {
        console.log(
          '✅ [HardwareID] Fetched hardware ID via IPC:',
          data.hardwareId
        );
        this.saveHardwareData(data);
        return data;
      }

      console.warn('⚠️ [HardwareID] IPC returned empty data');
      return null;
    } catch (error) {
      console.error(
        '❌ [HardwareID] Error fetching hardware ID via IPC:',
        error
      );
      return null;
    }
  }

  /**
   * Save hardware data to localStorage
   */
  private saveHardwareData(data: HardwareData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Hardware ID saved to localStorage');
    } catch (error) {
      console.error('Error saving hardware ID to localStorage:', error);
    }
  }

  /**
   * Get hardware data from localStorage
   */
  getHardwareData(): HardwareData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading hardware ID from localStorage:', error);
      return null;
    }
  }

  /**
   * Get just the hardware ID string
   */
  getHardwareId(): string | null {
    const data = this.getHardwareData();
    return data?.hardwareId || null;
  }

  /**
   * Check if running in Electron
   */
  private isElectron(): boolean {
    return !!(window && (window as any).electronAPI);
  }

  /**
   * Get the Electron API from window
   */
  private getElectronAPI(): any {
    return (window as any).electronAPI;
  }

  /**
   * Wait for hardware ID to be available with timeout (event-driven, no polling)
   * @param timeoutMs Maximum time to wait in milliseconds (default: 5000ms)
   * @returns Promise that resolves to hardware ID or null
   */
  async ensureHardwareId(timeoutMs: number = 5000): Promise<string | null> {
    const startTime = Date.now();

    // Check if already available in localStorage
    const existingId = this.getHardwareId();
    if (existingId) {
      console.log(
        '✅ [HardwareID] Hardware ID already available from storage:',
        existingId
      );
      return existingId;
    }

    if (!this.isElectron()) {
      console.warn(
        '⚠️ [HardwareID] Not in Electron environment, cannot retrieve hardware ID'
      );
      return null;
    }

    console.log(
      `⏳ [HardwareID] Waiting for hardware ID (timeout: ${timeoutMs}ms)...`
    );

    // Create a promise that will be resolved by event listeners
    return new Promise((resolve) => {
      let isResolved = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          const elapsed = Date.now() - startTime;
          console.error(
            `❌ [HardwareID] Hardware ID fetch timeout after ${elapsed}ms`
          );
          console.error('   Possible causes:');
          console.error(
            '   1. Electron main process failed to retrieve system info'
          );
          console.error('   2. IPC communication is broken');
          console.error('   3. Event listeners not properly set up');
          resolve(null);
        }
      }, timeoutMs);

      // Set up one-time success handler
      const onSuccess = (data: HardwareData) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          const elapsed = Date.now() - startTime;
          console.log(
            `✅ [HardwareID] Hardware ID received after ${elapsed}ms:`,
            data.hardwareId
          );
          resolve(data.hardwareId);
        }
      };

      // Set up one-time error handler
      const onError = (error: HardwareError) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          const elapsed = Date.now() - startTime;
          console.error(
            `❌ [HardwareID] Hardware ID error after ${elapsed}ms:`,
            error.message
          );
          resolve(null);
        }
      };

      // Listen for events
      if (this.isElectron()) {
        this.getElectronAPI()?.onHardwareId(onSuccess);
        this.getElectronAPI()?.onHardwareIdError(onError);

        // Try to fetch via IPC if not already in progress
        this.fetchHardwareId()
          .then((data) => {
            if (data && !isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              const elapsed = Date.now() - startTime;
              console.log(
                `✅ [HardwareID] Hardware ID fetched via IPC after ${elapsed}ms:`,
                data.hardwareId
              );
              resolve(data.hardwareId);
            }
          })
          .catch((error) => {
            if (!isResolved) {
              console.error('❌ [HardwareID] IPC fetch failed:', error);
              // Don't resolve here, let timeout handle it
            }
          });
      }
    });
  }

  /**
   * Clear hardware data from localStorage
   */
  clearHardwareData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Hardware ID cleared from localStorage');
  }
}
