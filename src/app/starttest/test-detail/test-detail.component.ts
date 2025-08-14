import { Component, OnInit } from '@angular/core';
import { CountryService } from 'src/app/services/country.service';
import { HistoryService } from 'src/app/services/history.service';
import { NetworkService } from 'src/app/services/network.service';
import { StorageService } from 'src/app/services/storage.service';
import { Router, NavigationEnd } from '@angular/router';
import { GigaAppPlugin } from '../../android/giga-app-android-plugin';
import { Capacitor } from '@capacitor/core';
import { isAndroid } from 'src/app/android/android_util';

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
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadData();
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
    isAndroid().then((isAndroid) => {
      if (isAndroid) {
        this.loadHistoricalData();
      } else {
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
          this.historicalData = JSON.parse(
            this.storage.get('historicalDataAll')
          );
          const allMeasurements = this.historicalData.measurements;

          // Get the last 10 measurements (sorted by timestamp descending)
          this.measurementsData = allMeasurements
            .sort(
              (
                a: { timestamp: string | number | Date },
                b: { timestamp: string | number | Date }
              ) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            ) // descending order
            .slice(0, 10); // take last 10
        }
      }
    });
  }

  async loadHistoricalData() {
    try {
      const result = await GigaAppPlugin.getHistoricalSpeedTestData();
      console.log(
        'Queue from native:',
        JSON.parse(JSON.stringify(result.historicalData))
      );
      //this.historicalData = JSON.parse(JSON.stringify(result.historicalData));
      this.historicalData = result.historicalData;

      const allMeasurements = this.historicalData;
      if (
        allMeasurements !== null &&
        allMeasurements !== undefined &&
        allMeasurements.length
      ) {
        this.measurementnetworkServer =
          allMeasurements[allMeasurements.length - 1].ClientInfo.City;
        this.measurementISP =
          allMeasurements[allMeasurements.length - 1].ClientInfo.ISP;
      }
      console.log('allMeasurements:', allMeasurements);
      // Get the last 10 measurements (sorted by timestamp descending)
      this.measurementsData = allMeasurements
        .sort(
          (
            a: { timestamp: string | number | Date },
            b: { timestamp: string | number | Date }
          ) => {
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          }
        ) // descending order
        .slice(0, 10); // take last 10
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  }
}
