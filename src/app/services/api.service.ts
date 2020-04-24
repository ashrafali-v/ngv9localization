import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpErrorResponse, HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { AppInsightsService } from './appinsights.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiVersion = '1.0/';

  constructor(private httpClient: HttpClient, private appInsights: AppInsightsService) { }

  getBaseUrl() {
    if (environment.debug) {
      // For local debugging, you can edit this api url.
      //return 'https://indiaqa.socxo.com/api/admin/' + this.apiVersion;
      return 'https://qa.socxo.com/api/admin/' + this.apiVersion;
      //return 'http://localhost:65313/';
    } else {
      return window.location.protocol + '//' + window.location.hostname + '/api/admin/' + this.apiVersion;
    }
  }

  getHostName() {
    if (environment.debug) {
      // For local debugging, you can edit this host name.
      //  return 'indiaqa.socxo.com';
      return 'qa.socxo.com';
    } else {
      return window.location.hostname;
    }
  }

  postData(endpoint: string, postData?: any, headers?: HttpHeaders, retryCount?: number, postParams?: HttpParams) {
    return this.httpClient.post(this.getBaseUrl() + endpoint,
      postData, { headers: headers, params: postParams }).pipe(
        retry(retryCount)
      );
  }

  getData(endPoint: string, retryCount: number, getParams?: HttpParams) {
    const url = this.getBaseUrl() + endPoint;
    return this.httpClient.get(url, { params: getParams }).pipe(
      retry(retryCount)
    );
  }
  getFormData(endPoint: string, headers: HttpHeaders, retryCount: number, getParams?: HttpParams) {
    const url = this.getBaseUrl() + endPoint;
    return this.httpClient.get(url, {headers: headers, params: getParams,responseType: 'blob' }).pipe(
      retry(retryCount)
    );
  }

  deleteData(endpoint: string, headers?: HttpHeaders, retryCount?: number, postParams?: HttpParams) {
    return this.httpClient.delete(this.getBaseUrl() + endpoint, { headers: headers, params: postParams }).pipe(
      retry(retryCount)
    );
  }

  patchData(endpoint: string, postData?: any, headers?: HttpHeaders, retryCount?: number, postParams?: HttpParams) {
    return this.httpClient.patch(this.getBaseUrl() + endpoint,
      postData, { headers: headers, params: postParams }).pipe(
        retry(retryCount)
      );
  }

  handleApiException(exception: HttpErrorResponse) {
    // Logs all api exceptions into application insights in azure.
    this.appInsights.logHttpExceptions(exception);
  }
}
