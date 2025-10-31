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

@Injectable({
  providedIn: 'root',
})
export class HardwareIdService {
  private readonly STORAGE_KEY = 'system_hardware_id';

  constructor() {
    this.initializeHardwareId();
  }

  /**
   * Initialize hardware ID listener when running in Electron
   */
  private initializeHardwareId(): void {
    if (this.isElectron()) {
      // Listen for hardware ID from main process
      this.getElectronAPI()?.onHardwareId((data: HardwareData) => {
        console.log('📥 Received hardware ID from Electron:', data.hardwareId);
        this.saveHardwareData(data);
      });

      // Also try to fetch it immediately
      this.fetchHardwareId();
    }
  }

  /**
   * Fetch hardware ID from Electron main process
   */
  async fetchHardwareId(): Promise<HardwareData | null> {
    if (!this.isElectron()) {
      console.warn('Not running in Electron, hardware ID not available');
      return null;
    }

    try {
      const data = await this.getElectronAPI()?.getHardwareId();
      if (data && !data.error) {
        console.log('✅ Fetched hardware ID:', data.hardwareId);
        this.saveHardwareData(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching hardware ID:', error);
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
   * Wait for hardware ID to be available with timeout
   * @param timeoutMs Maximum time to wait in milliseconds (default: 5000ms)
   * @returns Promise that resolves to hardware ID or null
   */
  async ensureHardwareId(timeoutMs: number = 5000): Promise<string | null> {
    // Check if already available in localStorage
    const existingId = this.getHardwareId();
    if (existingId) {
      console.log('✅ Hardware ID already available:', existingId);
      return existingId;
    }

    // If not in localStorage, wait for it to be fetched
    console.log('⏳ Waiting for hardware ID to be fetched...');

    return new Promise((resolve) => {
      const startTime = Date.now();

      // Set up timeout
      const timeout = setTimeout(() => {
        console.warn('⚠️ Hardware ID fetch timeout after', timeoutMs, 'ms');
        resolve(null);
      }, timeoutMs);

      // Poll for hardware ID (check every 100ms)
      const checkInterval = setInterval(() => {
        const hardwareId = this.getHardwareId();
        if (hardwareId) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          const elapsed = Date.now() - startTime;
          console.log(
            `✅ Hardware ID available after ${elapsed}ms:`,
            hardwareId
          );
          resolve(hardwareId);
        }
      }, 100);
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
