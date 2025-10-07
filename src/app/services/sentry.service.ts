import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/browser';

@Injectable({
  providedIn: 'root'
})
export class SentryService {
  constructor() {}

  captureException(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setExtra(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info', context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setExtra(key, context[key]);
        });
      }
      Sentry.captureMessage(message, level);
    });
  }

  setUser(id: string, email?: string, username?: string) {
    Sentry.setUser({
      id,
      email,
      username
    });
  }

  clearUser() {
    Sentry.setUser(null);
  }
} 