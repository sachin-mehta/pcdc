import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import {
  IonAccordionGroup,
  ModalController,
  MenuController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SchoolService } from '../services/school.service';
import { LoadingService } from '../services/loading.service';
import { NetworkService } from '../services/network.service';
import { SettingsService } from '../services/settings.service';
import { MlabService } from '../services/mlab.service';
import { MeasurementClientService } from '../services/measurement-client.service';
import { SharedService } from '../services/shared-service.service';
import { HistoryService } from '../services/history.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../services/storage.service';
import { Subscription } from 'rxjs';
import { CountryService } from '../services/country.service';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { mlabInformation, accessInformation } from '../models/models';
import { App } from '@capacitor/app';
@Component({
  selector: 'app-starttest',
  templateUrl: 'starttest.page.html',
  styleUrls: ['starttest.page.scss'],
  standalone: false,
})
export class StarttestPage implements OnInit, OnDestroy {
  @ViewChild(IonAccordionGroup, { static: true })
  accordionGroup: IonAccordionGroup;
  @ViewChild('errorMsg') el: ElementRef;
  progress: number = 0; // Progress in percentage (0-100)
  currentState = undefined;
  currentRate = undefined;
  currentRateUpload = undefined;
  currentRateDownload = undefined;
  latency = undefined;
  networkName = undefined;
  uploadStatus = undefined;
  uploadRate = undefined;
  isErrorClosed = false;
  connectionInformation: any;
  lastMeasurementId: number;
  selectedCountry: string;
  mlabInformation = {
    city: '',
    url: '',
    ip: [],
    fqdn: '',
    site: '',
    country: '',
    label: '',
    metro: '',
  };
  measurementISP: any;
  measurementnetworkServer: any;
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
  isLoaded = false;
  downloadStarted = false;
  uploadStarted = false;

  progressGaugeState = {
    type: 'full',
    minimum: 0,
    current: 0,
    maximum: 1,
    message: 'Start',
    foregroundColor: '#FFFFFF',
    backgroundColor: '#FFFF00',
  };
  onlineStatus: boolean;
  schools: any;
  schoolId: any;
  public currentDate: any;
  public connectionStatus: any;
  private sub: any;
  private downloadSub!: Subscription;
  private uploadSub!: Subscription;
  private downloadStartedSub!: Subscription;
  private uploadStartedSub!: Subscription;

  downloadTimer: any;
  uploadTimer: any;
  uploadProgressStarted = false; // To ensure we start upload animation only once
  school: any;

  isNative: boolean;
  gigaAppPlugin: any;
  constructor(
    private route: ActivatedRoute,
    public loading: LoadingService,
    public router: Router,
    private menu: MenuController,
    public alertController: AlertController,
    public modalController: ModalController,
    private schoolService: SchoolService,
    private networkService: NetworkService,
    private settingsService: SettingsService,
    private mlabService: MlabService,
    private measurementClientService: MeasurementClientService,
    private sharedService: SharedService,
    private historyService: HistoryService,
    public translate: TranslateService,
    private ref: ChangeDetectorRef,
    private storage: StorageService,
    private countryService: CountryService
  ) {
    if (this.storage.get('schoolId')) {
      this.school = JSON.parse(this.storage.get('schoolInfo'));
      console.log(this.school, 'heheh');
    }
    this.isNative = Capacitor.isNativePlatform();
    if (Capacitor.isNativePlatform()) {
      this.gigaAppPlugin = registerPlugin<any>('GigaAppPlugin');
    }
    this.onlineStatus = navigator.onLine;
    this.route.params.subscribe((params) => {
      if (this.onlineStatus) {
        this.measureReady();
      }
    });
    let applicationLanguage = this.settingsService.get('applicationLanguage');
    if (applicationLanguage) {
      if (typeof applicationLanguage === 'string') {
        translate.setDefaultLang(applicationLanguage);
      } else {
        translate.setDefaultLang(applicationLanguage.code);
      }
    }
    if (Capacitor.isNativePlatform()) {
      this.gigaAppPlugin.addListener('speedTestUpdate', (data: any) => {
        console.log(
          'GIGA NetworkTestService Data:',
          JSON.stringify(data, null, 2)
        );
        try {
          if (data.testStatus === 'onstart') {
            this.currentState = 'Starting';
            this.currentRate = undefined;
            this.currentRateUpload = undefined;
            this.currentRateDownload = undefined;
            this.ref.markForCheck();
            console.log('GIGA', 'Executed onstart');
          } else if (data.testStatus === 'upload') {
            console.log('Running Test (Upload)');
            this.downloadStarted = false;
            this.uploadStarted = true;
            if (this.downloadTimer) {
              clearInterval(this.downloadTimer);
            }
            this.currentState = 'Running Test (Upload)';
            this.currentRateDownload = data.downloadSpeed?.toFixed(2);
            this.currentRate = data.uploadSpeed?.toFixed(2);
            this.currentRateUpload = data.uploadSpeed?.toFixed(2);
            if (!this.uploadProgressStarted) {
              this.progress = 50;
              this.uploadProgressStarted = true;
              this.startUploadProgress();
            }
            this.ref.markForCheck();
            console.log('GIGA', 'Executed upload ');
          } else if (data.testStatus === 'download') {
            this.downloadStarted = true;
            this.uploadStarted = false;
            this.currentState = 'Running Test (Download)';
            this.currentRate = data.downloadSpeed?.toFixed(2);
            this.currentRateDownload = data.downloadSpeed?.toFixed(2);
            this.currentRateUpload = data.uploadSpeed?.toFixed(2);
            if (this.downloadStarted) {
              this.startDownloadProgress();
            }
            this.ref.markForCheck();
            console.log('GIGA', 'Executed download');
          } else if (data.testStatus === 'complete') {
            this.uploadStarted = false;
            if (this.uploadTimer) {
              clearInterval(this.uploadTimer);
            }
            this.progress = 100;
            this.currentState = 'Completed';
            this.currentDate = new Date();
            this.currentRate =
              data.speedTestData.results[
                'NDTResult.S2C'
              ].LastClientMeasurement.MeanClientMbps?.toFixed(2);
            this.currentRateUpload =
              data.speedTestData.results[
                'NDTResult.C2S'
              ].LastClientMeasurement.MeanClientMbps?.toFixed(2);
            this.currentRateDownload =
              data.speedTestData.results[
                'NDTResult.S2C'
              ].LastClientMeasurement.MeanClientMbps?.toFixed(2);
            this.progressGaugeState.current = this.progressGaugeState.maximum;
            if (
              data.speedTestData.results['NDTResult.S2C'].LastServerMeasurement
                .BBRInfo.MinRTT == null ||
              data.speedTestData.results['NDTResult.C2S'].LastServerMeasurement
                .BBRInfo.MinRTT == null
            ) {
              this.latency = '0';
            } else {
              this.latency = (
                (data.speedTestData.results['NDTResult.S2C']
                  .LastServerMeasurement.BBRInfo.MinRTT +
                  data.speedTestData.results['NDTResult.C2S']
                    .LastServerMeasurement.BBRInfo.MinRTT) /
                2 /
                1000
              ).toFixed(0);
            }
            if (
              data.speedTestData.ClientInfo !== null &&
              data.speedTestData.ClientInfo !== undefined
            ) {
              this.measurementnetworkServer =
                data.speedTestData.ClientInfo.City;
              this.measurementISP = data.speedTestData.ClientInfo.ISP;
            }
            console.log(
              'GIGA',
              'Executed complete :' + JSON.stringify(data.measurementsItem)
            );
            if (data.measurementsItem) {
              this.historyService.add(data.measurementsItem);
            }
            this.ref.markForCheck();
            this.refreshHistory();
            console.log('GIGA', 'Executed complete');
          } else if (data.testStatus === 'onerror') {
            this.gaugeError();
            this.currentState = undefined;
            this.currentRate = undefined;
            this.ref.markForCheck();
            console.log('GIGA', 'Executed onerror');
          } else {
            console.log('GIGA', 'Executed Else');
          }
        } catch (e) {
          this.gaugeError();
          this.currentState = undefined;
          this.currentRate = undefined;
          this.ref.markForCheck();
          console.log('GIGA', 'Exception to bind the data' + e);
        }
      });
    }

    window.addEventListener(
      'online',
      () => {
        // Re-sync data with server.
        try {
          console.log('Online');
          this.progress = 0;
          this.onlineStatus = true;
          this.currentState = undefined;
          this.currentRate = undefined;
          this.measureReady();
        } catch (e) {
          console.log(e);
        }
      },
      false
    );

    window.addEventListener(
      'offline',
      () => {
        // Queue up events for server.
        this.onlineStatus = false;
        this.connectionStatus = 'error';
        this.currentRate = 'error';
        this.isErrorClosed = false;
      },
      false
    );

    this.sharedService.on('settings:changed', (nameValue) => {
      if (nameValue.name == 'applicationLanguage') {
        translate.use(nameValue.value.code);
      }
      if (nameValue.name == 'metroSelection') {
        this.tryConnectivity();
      }
    });
    if (!this.storage.get('schoolId')) {
      this.router.navigate(['/']);
    }
    this.handleBackButton();
  }
  handleBackButton() {
    App.addListener('backButton', async () => {
      if (this.isNative) {
        // Exit app if there's no page to go back to
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
    this.schoolId = this.storage.get('schoolId');
    this.downloadSub =
      this.measurementClientService.downloadComplete$.subscribe((data) => {
        this.downloadStarted = false;
        if (this.downloadTimer) {
          clearInterval(this.downloadTimer);
        }
        this.progress = 50;
        this.ref.markForCheck();
      });

    this.countryService.getPcdcCountryByCode(this.school.country).subscribe(
      (response) => {
        this.selectedCountry = response[0].name;
      },
      (err) => {
        console.log('ERROR: ' + err);
        this.loading.dismiss();
      }
    );

    this.downloadStartedSub =
      this.measurementClientService.downloadStarted$.subscribe((data) => {
        this.downloadStarted = true;
        this.uploadStarted = false;
      });
    this.uploadStartedSub =
      this.measurementClientService.uploadStarted$.subscribe((data) => {
        this.uploadStarted = true;
        this.downloadStarted = false;
      });

    this.uploadSub = this.measurementClientService.uploadComplete$.subscribe(
      (data) => {
        this.uploadStarted = false;
        if (this.uploadTimer) {
          clearInterval(this.uploadTimer);
        }
        this.progress = 100;
        this.ref.markForCheck();
      }
    );
    window.addEventListener(
      'online',
      () => {
        console.log('Online 1');
        this.onlineStatus = true;
      },
      false
    );

    window.addEventListener(
      'offline',
      () => {
        console.log('Offline 1');
      },
      false
    );
    this.sharedService.on('measurement:status', this.driveGauge.bind(this));
    this.sharedService.on(
      'history:measurement:change',
      this.refreshHistory.bind(this)
    );
    this.sharedService.on('history:reset', this.refreshHistory.bind(this));
    this.refreshHistory();
  }

  measureReady() {
    try {
      this.tryConnectivity();
      this.isLoaded = true;
    } catch (e) {
      console.log(e);
    }
  }

  tryConnectivity() {
    const translatedText = this.translate.instant('searchCountry.loading');

    this.translate.get('searchCountry.loading').subscribe((translatedText) => {
      const loadingMsg = `
      <div class="loadContent">
        <ion-img src="assets/loader/new_loader.gif" class="loaderGif"></ion-img>
        <p class="green_loader">${translatedText}</p>
      </div>`;

      this.loading.present(loadingMsg, 15000, 'pdcaLoaderClass', 'null');
      this.networkService.getNetInfo().then((res) => {
        this.connectionStatus = 'success';
        if (this.loading.isStillLoading()) {
          this.loading.dismiss();
        }
        if (res) {
          this.accessInformation = res;
          console.log(this.accessInformation);
        }
      });
    });
  }

  refreshHistory() {
    let data = this.historyService.get();
    this.lastMeasurementId = data.measurements.length - 1;
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  closeMenu() {
    this.menu.open('end');
  }
  closeError() {
    // this.el.nativeElement.style.display = 'none';
    this.isErrorClosed = true;
  }

  showTestResult() {
    this.router.navigate(['connectivitytest']);
  }

  startNDT() {
    try {
      this.uploadProgressStarted = false;
      this.downloadStarted = false;
      this.uploadStarted = false;
      this.measurementnetworkServer = '';
      this.measurementISP = '';
      this.progress = 0;

      // Clear any ongoing timers
      if (this.downloadTimer) {
        clearInterval(this.downloadTimer);
        this.downloadTimer = null;
      }
      if (this.uploadTimer) {
        clearInterval(this.uploadTimer);
        this.uploadTimer = null;
      }

      this.currentState = 'Starting';
      this.uploadStatus = undefined;
      this.latency = undefined;
      this.connectionStatus = '';
      this.uploadProgressStarted = false;
      if (this.isNative) {
        this.gigaAppPlugin.executeManualSpeedTest();
      } else {
        this.measurementClientService.runTest();
      }
    } catch (e) {
      console.log(e);
    }
  }

  startDownloadProgress() {
    const target = 50;
    const duration = 10000; // total animation duration in ms (10 seconds)
    const interval = 200; // update every 200ms
    const steps = duration / interval;
    const stepSize = (target - this.progress) / steps;

    // Clear existing timer
    if (this.downloadTimer) {
      clearInterval(this.downloadTimer);
      this.downloadTimer = null;
    }

    // Reset progress if needed
    if (this.progress > target) {
      this.progress = 0;
    }

    let elapsedSteps = 0;

    this.downloadTimer = setInterval(() => {
      if (this.downloadStarted && this.progress < target) {
        this.progress += stepSize;
        elapsedSteps++;

        if (this.progress >= target || elapsedSteps >= steps) {
          this.progress = target;
          clearInterval(this.downloadTimer);
          this.downloadTimer = null;
        }
        this.ref.detectChanges(); // trigger UI update
      } else {
        clearInterval(this.downloadTimer);
        this.downloadTimer = null;
      }
    }, interval);
  }

  // Animate progress from 50 to 100
  startUploadProgress() {
    const target = 100;
    const interval = 200; // update every 50ms
    this.uploadTimer = setInterval(() => {
      if (this.progress < target) {
        this.progress += 1;
        if (this.progress >= target) {
          this.progress = target;
          clearInterval(this.uploadTimer);
        }
        this.ref.markForCheck();
      } else {
        clearInterval(this.uploadTimer);
      }
    }, interval);
  }

  driveGauge(event, data) {
    if (event === 'measurement:status') {
      console.log({ data });
      if (data.testStatus === 'error') {
        this.connectionStatus = 'error';
        this.currentRate = 'error';
      }
      if (data.testStatus === 'onstart') {
        this.currentState = 'Starting';
        this.currentRate = undefined;
        this.currentRateUpload = undefined;
        this.currentRateDownload = undefined;
        this.progress = 0;
      } else if (data.testStatus === 'interval_c2s') {
        console.log('Running Test (Upload)');
        this.currentState = 'Running Test (Upload)';
        this.currentRate = (
          (data.passedResults.Data.TCPInfo.BytesReceived /
            data.passedResults.Data.TCPInfo.ElapsedTime) *
          8
        ).toFixed(2);
        this.currentRateUpload = this.currentRate;
        if (!this.uploadProgressStarted) {
          this.uploadProgressStarted = true;
          this.startUploadProgress();
        }
      } else if (data.testStatus === 'interval_s2c') {
        this.currentState = 'Running Test (Download)';
        this.currentRate = data.passedResults.Data.MeanClientMbps?.toFixed(2);
        this.currentRateDownload =
          data.passedResults.Data.MeanClientMbps?.toFixed(2);
        if (this.downloadStarted) {
          this.startDownloadProgress();
        }
      } else if (data.testStatus === 'complete') {
        this.currentState = 'Completed';
        this.currentDate = new Date();
        this.currentRate =
          data.passedResults[
            'NDTResult.S2C'
          ].LastClientMeasurement.MeanClientMbps?.toFixed(2);
        this.currentRateUpload =
          data.passedResults[
            'NDTResult.C2S'
          ].LastClientMeasurement.MeanClientMbps?.toFixed(2);
        this.currentRateDownload =
          data.passedResults[
            'NDTResult.S2C'
          ].LastClientMeasurement.MeanClientMbps?.toFixed(2);
        this.progressGaugeState.current = this.progressGaugeState.maximum;
        this.latency = (
          (data.passedResults['NDTResult.S2C'].LastServerMeasurement.BBRInfo
            .MinRTT +
            data.passedResults['NDTResult.C2S'].LastServerMeasurement.BBRInfo
              .MinRTT) /
          2 /
          1000
        ).toFixed(0);
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
        this.ref.markForCheck();
        this.refreshHistory();
      } else if (data.testStatus === 'onerror') {
        this.gaugeError();
        this.currentState = undefined;
        this.currentRate = undefined;
        this.ref.markForCheck();
      }
      if (data.testStatus !== 'complete') {
        this.progressGaugeState.current = data.progress;
      }
    }
  }
  async presentTestFailModal() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.translate.instant('TEST FAILED'),
      message:
        '<strong>' +
        this.translate.instant(
          'The connection was interupted before testing could be completed.'
        ) +
        '</strong>',
      buttons: [
        {
          text: 'Okay',
          handler: () => {},
        },
      ],
    });
    await alert.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.translate.instant('Error'),
      message:
        '<strong>' +
        this.translate.instant(
          'Measurement server is not responding. Please close the app from system tray and try after sometime'
        ) +
        '</strong>',
      buttons: [
        {
          text: 'Okay',
          handler: () => {},
        },
      ],
    });
    await alert.present();
  }

  gaugeError() {
    this.progressGaugeState.current = this.progressGaugeState.maximum;
  }
  ngOnDestroy() {
    this.downloadSub.unsubscribe();
    this.uploadSub.unsubscribe();
    this.downloadStartedSub.unsubscribe();
    this.uploadStartedSub.unsubscribe();
  }
}
