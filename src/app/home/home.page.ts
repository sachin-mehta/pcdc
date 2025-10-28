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
import { HardwareIdService } from '../services/hardware-id.service';

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
  constructor(
    public router: Router,
    public translate: TranslateService,
    private settingsService: SettingsService,
    private storage: StorageService,
    private loading: LoadingService,
    private readonly schoolService: SchoolService,
    private hardwareIdService: HardwareIdService
  ) {
    translate.setDefaultLang('en');
    const applicationLanguage = this.settingsService.get('applicationLanguage');
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
      // User already has local registration - existing flow
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
          this.router.navigate(['/starttest']);
          this.loading.dismiss();
        }
      };
      getFlagsAndCheckGigaId();
    } else {
      // No local registration - check if machine is already registered via hardware ID
      const hardwareId = this.hardwareIdService.getHardwareId();

      if (hardwareId) {
        console.log(
          'Checking for existing registration with hardware ID:',
          hardwareId
        );
        this.checkMachineRegistration(hardwareId);
      } else {
        // No hardware ID available - proceed normally
        this.loading.dismiss();
      }
    }
  }

  /**
   * Check if this machine is already registered using hardware ID
   */
  private async checkMachineRegistration(hardwareId: string) {
    try {
      const response = await this.schoolService
        .checkRegistrationByHardwareId(hardwareId)
        .toPromise();

      // Backend returns: { success: true, data: {...}, timestamp, message }
      if (response?.success && response?.data) {
        // Found existing registration - populate localStorage
        console.log('✅ Found existing registration for this machine');
        await this.applyExistingRegistration(response.data);
        this.loading.dismiss();
        this.router.navigate(['/starttest']);
      } else {
        // No registration found - user needs to register
        console.log('ℹ️ No existing registration found');
        this.loading.dismiss();
      }
    } catch (err) {
      // API error - gracefully fallback to normal registration flow
      console.error('Error checking machine registration:', err);
      this.loading.dismiss();
    }
  }

  /**
   * Populate localStorage with existing registration data
   */
  private async applyExistingRegistration(registrationData: any) {
    await this.storage.set('schoolUserId', registrationData.user_id);
    await this.storage.set('schoolId', registrationData.school_id);
    await this.storage.set('gigaId', registrationData.giga_id);
    await this.storage.set('macAddress', registrationData.mac_address);
    await this.storage.set('deviceType', registrationData.os);
    await this.storage.set('ip_address', registrationData.ip_address);
    await this.storage.set('version', registrationData.app_version);
    await this.storage.set('country_code', registrationData.country_code);

    // Handle school_info which might be an object or string
    if (registrationData.school_info) {
      const schoolInfo =
        typeof registrationData.school_info === 'string'
          ? registrationData.school_info
          : JSON.stringify(registrationData.school_info);
      await this.storage.set('schoolInfo', schoolInfo);
    }

    console.log('✅ Registration data loaded from hardware ID');
  }

  openExternalUrl(href) {
    this.settingsService.getShell().shell.openExternal(href);
  }
}
