/* eslint-disable prefer-arrow/prefer-arrow-functions */
import * as Sentry from '@sentry/browser';
import { environment } from '../environments/environment'; // './esrc/environments/environment';
import { Capacitor } from '@capacitor/core';

export function initSentry() {
  console.log('GIGA Is Native Before Sentry : ', Capacitor.isNativePlatform());
  Sentry.init({
    dsn: Capacitor.isNativePlatform()
      ? 'https://425388d87bae44d7be09a88dd5548d7e@excubo.unicef.io/77'
      : 'https://e52e97fc558344bc80a218fc22a9a6a9@excubo.unicef.io/47', // Replace with your actual DSN
    environment: environment.mode === 'dev' ? 'development' : 'production',
    integrations: [
      Sentry.globalHandlersIntegration(),
      Sentry.breadcrumbsIntegration(),
      Sentry.linkedErrorsIntegration(),
      Sentry.functionToStringIntegration(),
      Sentry.inboundFiltersIntegration(),
    ],
    release: `giga-meter-angular@${environment.app_version}`,
  });
}
