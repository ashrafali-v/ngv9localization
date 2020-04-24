import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AppInsights } from 'applicationinsights-js';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppInsightsService {
  private config: Microsoft.ApplicationInsights.IConfig = {
    instrumentationKey: environment.appInsightInstrumentationKey
  }
  constructor() {
    if (!AppInsights.config) {
      AppInsights.downloadAndSetup(this.config);
    }
   }

   logHttpExceptions(exception: HttpErrorResponse) {
     AppInsights.trackException(exception);
   }
}
