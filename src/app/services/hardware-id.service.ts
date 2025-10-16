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
   * Clear hardware data from localStorage
   */
  clearHardwareData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Hardware ID cleared from localStorage');
  }
}
