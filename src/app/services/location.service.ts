import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

   async getWifiAccessPoints(): Promise<{ macAddress: string; signalStrength: number }[]> {
    const wifiList = await (window as any).electronAPI.getWifiList();
    const wifiAccessPoints = wifiList.map((wifi: any) => ({
      macAddress: wifi.macAddress,
      signalStrength: wifi.signal
    }));

    console.log(wifiList, 'wifiListwifiList')
    return wifiAccessPoints;
  }

}