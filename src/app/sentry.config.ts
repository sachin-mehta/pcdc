/* eslint-disable prefer-arrow/prefer-arrow-functions */
import * as Sentry from '@sentry/browser';
import { environment } from '../environments/environment'; // './esrc/environments/environment';
import { Capacitor, registerPlugin } from '@capacitor/core';

export function initSentry() {
  console.log('GIGA Is Native Before Sentry : ', Capacitor.isNativePlatform());
  Sentry.init({
    dsn: Capacitor.isNativePlatform()
      ? 'https://425388d87bae44d7be09a88dd5548d7e@excubo.unicef.io/77'
      : 'https://e52e97fc558344bc80a218fc22a9a6a9@excubo.unicef.io/47', // Replace with your actual DSN
    environment:
      environment.mode === 'prod'
        ? 'production'
        : environment.mode === 'stg'
        ? 'staging'
        : 'development',
    integrations: [
      new Sentry.Integrations.GlobalHandlers(),
      new Sentry.Integrations.TryCatch(),
      new Sentry.Integrations.Breadcrumbs(),
      new Sentry.Integrations.LinkedErrors(),
      new Sentry.Integrations.UserAgent(),
      new Sentry.Integrations.FunctionToString(),
      new Sentry.Integrations.InboundFilters(),
    ],
    tracesSampleRate: 1.0,
    release: `giga-meter-angular@${environment.app_version}`,
  });

  if (Capacitor.isNativePlatform()) {
    configureNativeEnvironment(
      environment.mode === 'prod'
        ? 'production'
        : environment.mode === 'stg'
        ? 'staging'
        : 'development'
    );
  }

  async function configureNativeEnvironment(env: string) {
    console.log(`GIGA Environment : ${env}`);
    const gigaAppPlugin = registerPlugin<any>('GigaAppPlugin');
    const result = await gigaAppPlugin.storeAndScheduleSpeedTest({
      env: env,
    });
  }
}
