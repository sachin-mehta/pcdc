import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SchoolService } from '../services/school.service';
import { LoadingService } from '../services/loading.service';
import { MenuController } from '@ionic/angular';
import { NetworkService } from '../services/network.service';
import { SettingsService } from '../services/settings.service';
import { MlabService } from '../services/mlab.service';
import { MeasurementClientService } from '../services/measurement-client.service';
import { CloudflareMeasurementService } from '../services/measurment-cloudflare-client.service';
import { SharedService } from '../services/shared-service.service';
import { HistoryService } from '../services/history.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../services/storage.service';
import { Subscription } from 'rxjs';
import { CountryService } from '../services/country.service';
import { mlabInformation, accessInformation } from '../models/models';

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
  private cloudflareDownloadSub?: Subscription;
  private cloudflareUploadSub?: Subscription;
  private cloudflareDownloadStartedSub?: Subscription;
  private cloudflareUploadStartedSub?: Subscription;
  private cloudflareProgressInterval: any;
  private cloudflareProgressStart = 0;
  private cloudflareProgressValue = 0;
  private isCloudflareProgressActive = false;
  private readonly TIME_FOR_CLOUDFLARE_TEST = 30; // seconds

  downloadTimer: any;
  uploadTimer: any;
  uploadProgressStarted = false; // To ensure we start upload animation only once
  school: any;

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
    private cloudflareMeasurementService: CloudflareMeasurementService,
    private sharedService: SharedService,
    private historyService: HistoryService,
    public translate: TranslateService,
    private ref: ChangeDetectorRef,
    private storage: StorageService,
    private countryService: CountryService
  ) {
    if (this.storage.get('schoolId')) {
      this.school = JSON.parse(this.storage.get('schoolInfo'));
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
        console.log('Upload complete received');
        this.progress = 100;
        this.ref.markForCheck();
      }
    );

    this.cloudflareDownloadSub =
      this.cloudflareMeasurementService.downloadComplete$.subscribe(() => {
        this.downloadStarted = false;
        if (this.downloadTimer) {
          clearInterval(this.downloadTimer);
        }
        this.ref.markForCheck();
      });

    this.cloudflareUploadSub =
      this.cloudflareMeasurementService.uploadComplete$.subscribe(() => {
        this.uploadStarted = false;
        if (this.uploadTimer) {
          clearInterval(this.uploadTimer);
        }
        this.ref.markForCheck();
      });

    this.cloudflareDownloadStartedSub =
      this.cloudflareMeasurementService.downloadStarted$.subscribe(() => {
        this.downloadStarted = true;
        this.uploadStarted = false;
      });

    this.cloudflareUploadStartedSub =
      this.cloudflareMeasurementService.uploadStarted$.subscribe(() => {
        this.uploadStarted = true;
        this.downloadStarted = false;
      });
    window.addEventListener(
      'online',
      () => {
        console.log('Online 1');
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
    this.sharedService.on('measurement:status', this.driveGaugeNdt7.bind(this));
    this.sharedService.on(
      'measurement:status',
      this.driveGaugeCloadflare.bind(this)
    );
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

  startMeasurement() {
    let provider: 'cloudflare' | 'ndt7' ; // This can be dynamic based on feature flags 
    provider = 'cloudflare'; // For example, hardcoded to 'cloudflare' for now
    switch (provider) {
      // @ts-ignore
      case 'cloudflare':
          this.startCloudflare();
        break;
      // @ts-ignore
      case 'ndt7':
        this.startNDT();
        break;
    }
  }

  private beginCloudflareProgressSimulation(): void {
    this.stopCloudflareProgressSimulation();
    this.isCloudflareProgressActive = true;
    this.cloudflareProgressStart = Date.now();
    this.cloudflareProgressValue = 0;
    this.updateCloudflareProgress(0, true);

    this.cloudflareProgressInterval = setInterval(() => {
      if (!this.isCloudflareProgressActive) {
        this.stopCloudflareProgressSimulation();
        return;
      }

      const elapsed = Date.now() - this.cloudflareProgressStart;
      const elapsedSeconds = elapsed / 1000;
      const simulated = Math.min(0.95, elapsedSeconds / this.TIME_FOR_CLOUDFLARE_TEST);

      this.updateCloudflareProgress(simulated);
    }, 100);
  }

  private stopCloudflareProgressSimulation(finalProgress?: number): void {
    if (this.cloudflareProgressInterval) {
      clearInterval(this.cloudflareProgressInterval);
      this.cloudflareProgressInterval = null;
    }
    this.isCloudflareProgressActive = false;

    if (typeof finalProgress === 'number') {
      this.updateCloudflareProgress(finalProgress, true);
    }
  }

  private updateCloudflareProgress(value: number, force = false): void {
    const bounded = Math.min(1, value);
    if (!force && bounded <= this.cloudflareProgressValue) {
      return;
    }

    this.cloudflareProgressValue = bounded;
    this.progressGaugeState.current = bounded;
    this.progress = Math.floor(bounded * 100);
    this.ref.markForCheck();
  }

  startCloudflare() {
    try {
      this.uploadProgressStarted = false;
      this.downloadStarted = false;
      this.uploadStarted = false;
      this.measurementnetworkServer = '';
      this.measurementISP = '';
      this.progress = 0;
      this.progressGaugeState.current = this.progressGaugeState.minimum;

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
      this.beginCloudflareProgressSimulation();
      this.cloudflareMeasurementService.runTest();
    } catch (e) {
      console.error(e);
    }
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
      this.stopCloudflareProgressSimulation();
      this.measurementClientService.runTest();
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

  driveGaugeCloadflare(event, data) {
    if (event !== 'measurement:status') {
      return;
    }

    if (!data || data.provider !== 'cloudflare') {
      return;
    }

    const testStatus = data.testStatus;
    const toFixedOrDefault = (value: number | undefined, digits = 2) => {
      if (value === undefined || !Number.isFinite(value)) {
        return '0.00';
      }
      return (value/ 1000000).toFixed(digits);
    };

    switch (testStatus) {
      case 'cf_error':
        // this.stopCloudflareProgressSimulation();
        this.connectionStatus = 'error';
        this.currentRate = 'error';
        this.downloadStarted = false;
        this.uploadStarted = false;
        this.gaugeError();
        console.log('Cloudflare test error');
        // this.progress = 100;
        // if (this.downloadTimer) {
        //   clearInterval(this.downloadTimer);
        //   this.downloadTimer = null;
        // }
        // if (this.uploadTimer) {
        //   clearInterval(this.uploadTimer);
        //   this.uploadTimer = null;
        // }
        this.ref.markForCheck();
        return;

      case 'cf_onstart':
        if (!this.isCloudflareProgressActive) {
          this.beginCloudflareProgressSimulation();
        }
        this.currentState = 'Starting';
        this.currentRate = undefined;
        this.currentRateUpload = undefined;
        this.currentRateDownload = undefined;
        this.latency = undefined;
        this.updateCloudflareProgress(0, true);
        this.ref.markForCheck();
        return;

      case 'cf_interval_download': {
        const downloadMbps = Number(data.downloadCurrentSpeed ?? 0);
        this.currentState = 'Running Test (Download)';
        this.currentRate = toFixedOrDefault(downloadMbps);
        this.currentRateDownload = this.currentRate;
        this.ref.markForCheck();
        return;
      }

      case 'cf_interval_upload': {
        const uploadMbps = Number(data.uploadCurrentSpeed ?? 0);
        this.currentState = 'Running Test (Upload)';
        this.currentRate = toFixedOrDefault(uploadMbps);
        this.currentRateUpload = this.currentRate;
        this.ref.markForCheck();
        return;
      }

      case 'cf_complete': {
        this.stopCloudflareProgressSimulation(1);
        const results = data.passedResults || {};
        const summary = results?.summary ?? {};
        const downloadSummary = Number(
          summary.download ?? data.downloadCurrentSpeed ?? 0
        );
        const uploadSummary = Number(
          summary.upload ?? data.uploadCurrentSpeed ?? 0
        );
        const latencySummary = Number(
          summary.latency ?? results?.unloadedLatency?.latency ?? 0
        );

        this.currentState = 'Completed';
        this.currentDate = new Date();
        this.currentRate = toFixedOrDefault(downloadSummary);
        this.currentRateDownload = toFixedOrDefault(downloadSummary);
        this.currentRateUpload = toFixedOrDefault(uploadSummary);
        this.latency = Number.isFinite(latencySummary)
          ? latencySummary.toFixed(0)
          : undefined;
        console.log("On complete data:", data);
        this.progress = 100;
        this.progressGaugeState.current = this.progressGaugeState.maximum;
        this.connectionStatus = 'success';
        this.downloadStarted = false;
        this.uploadStarted = false;
        this.uploadProgressStarted = false;

        const historicalData = this.historyService.get();
        const cloudflareMeasurements = historicalData?.measurements;
        const lastMeasurement =
          Array.isArray(cloudflareMeasurements) &&
          cloudflareMeasurements.length > 0
            ? cloudflareMeasurements[cloudflareMeasurements.length - 1]
            : undefined;
        if (lastMeasurement) {
          this.measurementnetworkServer =
            lastMeasurement?.mlabInformation?.city || '';
          this.measurementISP = lastMeasurement?.accessInformation?.org || '';
        }

        this.ref.markForCheck();
        this.refreshHistory();
        return;
      }

      default:
        this.ref.markForCheck();
    }
  }

  driveGaugeNdt7(event, data) {
    if (event === 'measurement:status') {
      if (!data || data.provider === 'cloudflare') {
        return;
      }
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
        const historicalData = this.historyService.get();
        const measurements = historicalData?.measurements;
        if (Array.isArray(measurements) && measurements.length) {
          const lastMeasurement = measurements[measurements.length - 1];
          this.measurementnetworkServer =
            lastMeasurement?.mlabInformation?.city || '';
          this.measurementISP = lastMeasurement?.accessInformation?.org || '';
        }
        this.ref.markForCheck();
        this.refreshHistory();
      } else if (data.testStatus === 'onerror') {
        this.gaugeError();
        this.currentState = undefined;
        this.currentRate = undefined;
        this.ref.markForCheck();
      }
      if (data.testStatus !== 'complete' && typeof data.progress === 'number') {
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
    this.cloudflareDownloadSub?.unsubscribe();
    this.cloudflareUploadSub?.unsubscribe();
    this.cloudflareDownloadStartedSub?.unsubscribe();
    this.cloudflareUploadStartedSub?.unsubscribe();
    this.stopCloudflareProgressSimulation();
  }
}
