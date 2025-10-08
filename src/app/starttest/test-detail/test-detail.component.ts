import { Component, OnInit } from '@angular/core';
import { CountryService } from 'src/app/services/country.service';
import { HistoryService } from 'src/app/services/history.service';
import { NetworkService } from 'src/app/services/network.service';
import { StorageService } from 'src/app/services/storage.service';
import { Router, NavigationEnd } from '@angular/router';
import { GigaAppPlugin } from '../../android/giga-app-android-plugin';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { MenuController } from '@ionic/angular';
@Component({
  selector: 'app-test-detail',
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.scss'],
  standalone: false,
})
export class TestDetailComponent implements OnInit {
  schoolId: string;
  school: any;
  historicalData: any;
  measurementsData: [];
  accessInformation = {
    ip: '',
    city: '',
    region: '',
    country: '',
    label: '',
    metro: '',
    site: '',
    url: '',
    fqdn: '',
    loc: '',
    org: '',
    postal: '',
    timezone: '',
    asn: '',
  };
  measurementnetworkServer: any;
  measurementISP: any;
  selectedCountry: any;
  isNative: boolean;
  constructor(
    private storage: StorageService,
    private historyService: HistoryService,
    private countryService: CountryService,
    private router: Router,
    private menu: MenuController
  ) {
    this.isNative = Capacitor.isNativePlatform();
    this.handleBackButton();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadData();
      }
    });
  }

  isNativeApp(): boolean {
    return this.isNative;
  }

  handleBackButton() {
    App.addListener('backButton', async () => {
      if (this.isNative) {
        // Exit app if Native App
        const isMenuOpen = await this.menu.isOpen();
        if (isMenuOpen) {
          // ✅ If side menu is open → close it
          this.menu.close();
          return;
        }
        App.exitApp();
      } else {
        // Let Ionic handle the navigation
        window.history.back();
      }
    });
  }
  ngOnInit() {
    if (this.storage.get('schoolId')) {
      this.school = JSON.parse(this.storage.get('schoolInfo'));
      this.countryService.getPcdcCountryByCode(this.school.country).subscribe(
        (response) => {
          this.selectedCountry = response[0].name;
        },
        (err) => {
          console.log('ERROR: ' + err);
        }
      );
    }
    this.loadData();
  }

  loadData() {
    this.schoolId = this.storage.get('schoolId');

    let historicalData = this.historyService.get();
    if (
      historicalData !== null &&
      historicalData !== undefined &&
      historicalData.measurements.length
    ) {
      this.measurementnetworkServer =
        historicalData.measurements[
          historicalData.measurements.length - 1
        ].mlabInformation.city;
      this.measurementISP =
        historicalData.measurements[
          historicalData.measurements.length - 1
        ].accessInformation.org;
    }
    if (this.storage.get('historicalDataAll')) {
      this.historicalData = JSON.parse(this.storage.get('historicalDataAll'));
      const allMeasurements = this.historicalData.measurements;

      // Get the last 10 measurements (sorted by timestamp descending)
      this.measurementsData = allMeasurements
        .sort(
          (
            a: { timestamp: string | number | Date },
            b: { timestamp: string | number | Date }
          ) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ) // descending order
        .slice(0, 10); // take last 10
    }
  }
}
