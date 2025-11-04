import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, from, throwError, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

declare global {
  interface Window {
    deviceAPI: {
      getDeviceFingerprint: () => Promise<string>;
      saveToken: (token: string) => Promise<void>;
      getToken: () => Promise<string | null>;
    };
    hmac: {
      sign: (args: {
        secretkey: string;
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
  constructor(private http: HttpClient) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isHeaderNeeded(request.url)) {
      return next.handle(request);
    }

    return from(window.deviceAPI.getToken()).pipe(
      switchMap((token) => {
        if (!token) {
          // No token → continue without headers
          return next.handle(request);
        }

        // Generate nonce + signature (convert Promise to Observable)
        const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
        const nonce = btoa(String.fromCharCode(...nonceBytes));

        return from(
          window.hmac.sign({
            secretkey: environment.HMAC_SECRET,
            token,
            nonce,
          })
        ).pipe(
          switchMap(({ signature, timestamp }) => {
            const authReq = request.clone({
              setHeaders: {
                Authorization: `Device ${token}`,
                'x-device-nonce': nonce,
                'X-HMAC-Signature': signature,
                'x-timestamp': String(timestamp),
              },
            });

            return next.handle(authReq).pipe(
              catchError((error: HttpErrorResponse) => {
                if (
                  error.status === 401 &&
                  error.error?.message === 'Invalid device token or not authorized to access'
                ) {
                  // Token invalid → fetch new one
                  return this.fetchNewToken().pipe(
                    switchMap((newToken) => {
                      const newNonceBytes = crypto.getRandomValues(new Uint8Array(32));
                      const newNonce = btoa(String.fromCharCode(...newNonceBytes));

                      return from(
                        window.hmac.sign({
                          secretkey: environment.HMAC_SECRET,
                          token: newToken,
                          nonce: newNonce,
                        })
                      ).pipe(
                        switchMap(({ signature: newSignature, timestamp: newTimestamp }) => {
                          const retryReq = request.clone({
                            setHeaders: {
                              Authorization: `Device ${newToken}`,
                              'x-device-nonce': newNonce,
                              'X-HMAC-Signature': newSignature,
                              'x-timestamp': String(newTimestamp),
                            },
                          });
                          return next.handle(retryReq);
                        })
                      );
                    })
                  );
                }

                return throwError(() => error);
              })
            );
          })
        );
      })
    );
  }

  private isHeaderNeeded(url: string) {
    return url.includes(environment.restAPI);
  }

  /**
   * Fetch a new device token and save it
   */
  private fetchNewToken(): Observable<string> {
    return from(window.deviceAPI.getDeviceFingerprint()).pipe(
      switchMap((fingerprint) =>
        this.http
          .post<{ token: string }>(`${environment.restAPI}auth/initialize`, {
            deviceId: fingerprint,
          })
          .pipe(
            switchMap((response) =>
              from(window.deviceAPI.saveToken(response.token)).pipe(
                switchMap(() => of(response.token))
              )
            )
          )
      )
    );
  }
}