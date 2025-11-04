import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription, timer } from 'rxjs';
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

interface AuthResponse {
  token: string;
  expiresAt: number;
  expiresIn: number;
  issuedAt: number;
  deviceId: string;
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceAuthService implements OnDestroy {
  private apiUrl = `${environment.restAPI}auth/initialize`;
  private refreshSub?: Subscription;

  constructor(private http: HttpClient) {}

  /**
   * Main device authentication logic
   * Authenticates the device and schedules token refresh before expiry
   */
  async authenticateDevice(): Promise<string> {
    try {
      // 1. Check if token already exists in safe storage
      const existingToken = await window.deviceAPI.getToken();
      if (existingToken) {
        console.log('Token loaded from safe storage');
        // You could optionally skip refresh scheduling here, but safer to re-authenticate
        return existingToken;
      }

      // 2. Get fingerprint from preload
      const fingerprint = await window.deviceAPI.getDeviceFingerprint();

      // 3. Get token from backend
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(this.apiUrl, { deviceId: fingerprint })
      );

      const token = response.token;

      // 4. Save token securely
      await window.deviceAPI.saveToken(token);
      console.log('Token saved to secure storage');

      // 5. Schedule token refresh before expiry
      this.scheduleTokenRefresh(response);

      return token;
    } catch (error) {
      console.error('Device authentication failed:', error);
      throw error;
    }
  }

  /**
   * Sets up a timer to refresh token before it expires
   * @param response API response containing expiresIn/expiresAt
   */
  private scheduleTokenRefresh(response: AuthResponse): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe(); // clear any existing refresh
    }

    const refreshBeforeMs = 30 * 1000; // refresh 30s before expiry (configurable)
    const now = Date.now();
    const expiresAt = response.expiresAt || now + response.expiresIn;
    const delay = Math.max(expiresAt - now - refreshBeforeMs, 10000); // ensure min delay 10s

    console.log(`Scheduling token refresh in ${delay / 1000}s`);

    this.refreshSub = timer(delay).subscribe(async () => {
      console.log('Token refresh triggered before expiry');
      await this.refreshToken(response.deviceId);
    });
  }

  /**
   * Refreshes token by calling backend again using same deviceId
   */
  private async refreshToken(deviceId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(this.apiUrl, { deviceId })
      );

      const newToken = response.token;
      await window.deviceAPI.saveToken(newToken);
      console.log(' Token refreshed and saved again');

      // Reschedule next refresh
      this.scheduleTokenRefresh(response);
    } catch (err) {
      console.error('Failed to refresh token:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
}