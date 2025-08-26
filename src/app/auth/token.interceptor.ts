import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

declare global {
  interface Window {
    deviceAPI: {
      getDeviceFingerprint: () => Promise<string>;
      saveToken: (token: string) => Promise<void>;
      getToken: () => Promise<string | null>;
    };
    hmac: {
      sign: (args: {
        token: string;
        nonce: string;
        payload?: any;
        timestamp?: number;
      }) => Promise<{ signature: string; timestamp: number }>;
    };
  }
}

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isHeaderNeeded(request.url)) {
      return next.handle(request);
    }

    return from(window.deviceAPI.getToken()).pipe(
      switchMap(async (token) => {
        if (!token) {
          // No token → just pass the request as-is
          return next.handle(request);
        }

        // Generate nonce
        const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
        const nonce = btoa(String.fromCharCode(...nonceBytes));

        // Ask main process to sign
        const { signature, timestamp } = await window.hmac.sign({
          token,
          nonce,
        });

        // Clone request with headers
        const authReq = request.clone({
          setHeaders: {
            Authorization: `Device ${token}`,
            'x-device-nonce': nonce,
            'X-HMAC-Signature': signature,
            'x-timestamp': String(timestamp)
          }
        });

        return next.handle(authReq);
      }),
      switchMap((result) => from(result))
    );
  }

  private isHeaderNeeded(url: string) {
    return url.indexOf(environment.restAPI) !== -1;
  }
}
