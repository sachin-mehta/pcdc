import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  async getWifiAccessPoints(): Promise<{ macAddress: string; signalStrength: number }[]> {
    const wifiList = await (window as any).electronAPI.getWifiList();
    return wifiList.map((wifi: any) => ({
      macAddress: wifi.macAddress,
      signalStrength: wifi.signal
    }));
  }

  /** Send wifi list to backend, backend returns lat/long */
  resolveGeolocation(wifiAccessPoints: any) {
    return this.http.post<{ latitude: number; longitude: number }>(
      `${environment.restAPI}geolocation/geolocate
 `,
      { wifiAccessPoints }
    );
  }

  /** Save geolocation in localStorage */
  saveGeolocation(geo: { latitude: number; longitude: number }) {
    localStorage.setItem('geolocation', JSON.stringify(geo));
  }

  /** Get geolocation from localStorage */
  getSavedGeolocation(): { latitude: number; longitude: number } | null {
    const data = localStorage.getItem('geolocation');
    return data ? JSON.parse(data) : null;
  }
}
