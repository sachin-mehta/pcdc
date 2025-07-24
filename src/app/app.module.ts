import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ErrorHandler } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { SentryService } from './services/sentry.service';
import { SentryErrorHandler } from './core/sentry-error-handler';

/* Import token interceptor */
import { TokenInterceptor } from './auth/token.interceptor';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';

export function tokenGetter() {
  return environment.token;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    FormsModule,
    BrowserModule, 
    IonicModule.forRoot(), 
    SharedModule, 
    AppRoutingModule, 
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptorsFromDi()),
    SentryService,
    { provide: ErrorHandler, useClass: SentryErrorHandler }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
