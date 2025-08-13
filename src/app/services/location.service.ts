import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  private canRunGeoToday(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    const log = JSON.parse(localStorage.getItem('geoLog') || '[]')
      .filter((date: string) => date.startsWith(today));
    return log.length < 3;
  }

  private logGeoRun(): void {
    const log = JSON.parse(localStorage.getItem('geoLog') || '[]');
    log.push(new Date().toISOString());
    localStorage.setItem('geoLog', JSON.stringify(log));
  }

  async getAndStoreGeolocation(storage: any, measurementFlow): Promise<any> {
    if (!this.canRunGeoToday() && measurementFlow) {
      console.log('Daily geolocation limit reached — using last stored value.');
      return JSON.parse(storage.get('geolocation'));
    }

    const wifiList = await (window as any).electronAPI.getWifiList();
    const wifiAccessPoints = wifiList.map((wifi: any) => ({
      macAddress: wifi.macAddress,
      signalStrength: wifi.signal
    }));

    const locationRes = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCNqHJyhVBbmk3ANhjM9FSYL2w0vQEudrU`,
      {
        method: 'POST',
        body: JSON.stringify({ wifiAccessPoints }),
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const location = await locationRes.json();

    const geolocation: Record<string, any> = {};
    Object.entries(location.location).forEach(([key, value]) => {
      geolocation[key] = value;
    });

    storage.set('geolocation', JSON.stringify(geolocation));
    if (measurementFlow) {
      this.logGeoRun();
    }

    return geolocation;
  }
}