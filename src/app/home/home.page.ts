import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../app/services/settings.service';
import { NotFound } from '../schoolnotfound/types';
import { LoadingService } from '../services/loading.service';
import { SchoolService } from '../services/school.service';
import { StorageService } from '../services/storage.service';
import { checkRightGigaId, removeUnregisterSchool } from './home.utils';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { GigaAppPlugin } from '../android/giga-app-android-plugin';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  appName = environment.appName;
  appNameSuffix = environment.appNameSuffix;
  privacyUrl1 = 'https://opendatacommons.org/licenses/odbl/1-0/';
  privacyUrl2 = 'https://www.measurementlab.net/privacy/';
  targetUrl = '_blank';
  isPrivacyChecked = false;
  isNative: boolean;
  constructor(
    public router: Router,
    public translate: TranslateService,
    private settingsService: SettingsService,
    private storage: StorageService,
    private loading: LoadingService,
    private historyService: HistoryService,
    private readonly schoolService: SchoolService
  ) {
    translate.setDefaultLang('en');
    const applicationLanguage = this.settingsService.get('applicationLanguage');
    this.isNative = Capacitor.isNativePlatform();
    if (!applicationLanguage) {
      this.settingsService.setSetting('applicationLanguage', {
        code: 'en',
        name: 'English',
      });
    }
    if (applicationLanguage) {
      if (typeof applicationLanguage === 'string') {
        translate.setDefaultLang(applicationLanguage);
      } else {
        translate.setDefaultLang(applicationLanguage.code);
      }
    }
    const loadingMsg =
      // eslint-disable-next-line max-len
      '<div class="loadContent"><ion-img src="assets/loader/new_loader.gif" class="loaderGif"></ion-img><p class="white" [translate]="\'loading\'">Loading...</p></div>';
    this.loading.present(loadingMsg, 6000, 'pdcaLoaderClass', 'null');
    if (this.storage.get('schoolId')) {
      let schoolId = this.storage.get('schoolId');
      const gigaId = this.storage.get('gigaId');
      const schoolUserId = this.storage.get('schoolUserId');

      const getFlagsAndCheckGigaId = async () => {
        try {
          // get the feature flags
          await settingsService.getFeatureFlags();
          // check if the gigaId is correct
          schoolId = this.storage.get('schoolId');
          removeUnregisterSchool(
            schoolId,
            schoolService,
            storage,
            settingsService
          ).then((response) => {
            if (response) {
              loading.dismiss();
              if (this.isNative) {
                this.getHistoricalDataForNativeApp();
              }
              this.router.navigate(['/starttest']);
            } else {
              loading.dismiss();
              this.router.navigate([
                'schoolnotfound',
                schoolId,
                0,
                0,
                NotFound.notRegister,
              ]);
            }
          });
        } catch (e) {
          if (this.isNative) {
            await this.getHistoricalDataForNativeApp();
          }
          this.router.navigate(['/starttest']);
          this.loading.dismiss();
        }
      };
      getFlagsAndCheckGigaId();
    } else {
      this.loading.dismiss();
    }
  }

  async getHistoricalDataForNativeApp() {
    try {
      const result = await GigaAppPlugin.getHistoricalSpeedTestData();
      console.log(
        'Queue from native: home',
        JSON.parse(JSON.stringify(result.historicalData))
      );
      console.log('Queue from native: home', result.historicalData);
      let historicalData = result.historicalData;
      if (
        historicalData !== null &&
        historicalData !== undefined &&
        historicalData.measurements.length
      ) {
        this.historyService.set(historicalData);
        const allHistoryData = this.historyService.getAll();
        console.log(
          'Queue from native: home all',
          allHistoryData.measurements.length
        );
        if (historicalData.measurements.length > 0) {
          const merged = [
            ...allHistoryData.measurements,
            ...historicalData.measurements,
          ].reduce((acc, item) => {
            if (!acc.some((element) => element.uuid === item.uuid)) {
              acc.push(item);
            }
            return acc;
          }, []);
          console.log('Queue from native: home merged', merged.length);
          this.historyService.setAll(merged);
        } else {
          this.historyService.setAll(historicalData);
        }
        this.historyService.setAll(historicalData);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  }

  openExternalUrl(href) {
    if (Capacitor.isNativePlatform()) {
      this.openNativeAppBrowser(href);
    } else {
      this.settingsService.getShell().shell.openExternal(href);
    }
  }

  async openNativeAppBrowser(href) {
    await Browser.open({
      url: href,
      windowName: '_system', // ensures it uses external browser where possible
    });
  }
}
