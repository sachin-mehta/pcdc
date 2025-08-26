import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/_environment.prod';

declare global {
  interface Window {
    deviceAPI: {
      getDeviceFingerprint: () => Promise<string>;
      saveToken: (token: string) => Promise<void>;
      getToken: () => Promise<string | null>;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeviceAuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth/initialize'; // adjust endpoint if needed

  constructor(private http: HttpClient) {}

  /**
   * Authenticates the device using fingerprint.
   * If token exists in safe storage, returns it.
   * Otherwise, calls backend and saves it.
   */
  async authenticateDevice(): Promise<string> {
    try {
      // 1. Check if token already exists in safe storage
      const existingToken = await window.deviceAPI.getToken();
      if (existingToken) {
        console.log('Token loaded from safe storage');
        return existingToken;
      }

      // 2. Get fingerprint from preload
      const fingerprint = await window.deviceAPI.getDeviceFingerprint();

      // 3. Send to backend
      const response = await firstValueFrom(
        this.http.post<{ token: string }>(this.apiUrl, { deviceId: fingerprint })
      );

      const token = response.token;

      // 4. Save token securely
      console.log('trigger svae token')
const result = await window.deviceAPI.saveToken(token);
console.log('saveToken result from main:', result);

      return token;
    } catch (error) {
      console.error('Device authentication failed:', error);
      throw error;
    }
  }
}
