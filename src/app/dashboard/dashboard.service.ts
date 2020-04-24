import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service'
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  colorSets = ['rgb(105,87,115)', 'rgb(134,110,54)', 'rgb(55,132,129)', 'rgb(8,153,181)', 'rgb(59,166,97)', 'rgb(114,134,247)',
    'rgb(147,140,229)', 'rgb(216,145,140)', 'rgb(163,184,197)', 'rgb(208,190,220)', 'rgb(207,227,126)', 'rgb(210,223,225)',
    'rgb(194,172,133)', 'rgb(255,157,118)', 'rgb(139,186,187)'];

  backgroundSets = ['rgba(105,87,115,0.4)', 'rgba(134,110,54,0.4)', 'rgba(55,132,129,0.4)', 'rgba(8,153,181,0.4)', 'rgba(59,166,97,0.4)', 'rgba(114,134,247,0.4)',
    'rgba(147,140,229,0.4)', 'rgba(216,145,140,0.4)', 'rgba(163,184,197,0.4)', 'rgba(208,190,220,0.4)', 'rgba(207,227,126,0.4)', 'rgba(210,223,225,0.4)',
    'rgba(194,172,133,0.4)', 'rgba(255,157,118,0.4)', 'rgba(139,186,187,0.4)'];

  dashboardApiEndPoints = {
    topAdvocate: 'dashboard/topadvocatesbydate',
    topBlurbByDate: 'dashboard/toptrendingblurbsbydate',
    granularSocialMediaAnalytics: 'dashboard/granularsocialmediaanalytics',
    contentPerformanceByDate: 'dashboard/getpageviewsbydate',
    granularEarnedMediaValueAnalytics: 'dashboard/granularearnedmediavalueanalytics',
    granularGoogleAnalytics: 'dashboard/getgranulargoogleanalytics',
    dashboardTotals: 'dashboard/dashboardtotals',
    pageViewTotals: 'dashboard/getpageviewtotalsbydate',
    emvmetrics: 'dashboard/emvmetrics',
    gooleAnalyticsProfiles: 'dashboard/getgoogleanalyticsprofiles',
    gooleAnalyticsMetrics: 'dashboard/getgoogleanalyticsmetrics',
    googleAnalyticsTraffic: 'dashboard/getgoogleanalyticstraffic',
    detailedGoogleAnalyticsTraffic: 'dashboard/getdetailedgoogleanalyticstraffic',
    googleAnalyticsGoals: 'dashboard/getgoogleanalyticsgoals',
    granularGoogleGoalAnalytics: 'dashboard/getgranulargooglegoalanalytics',
    contentAnalyticsViewMore: 'dashboard/contentanalyticsviewmore',
    userDetails: 'dashboard/getuserwisecontentperformanceanalytics'
  };

  constructor(private apiService: ApiService) { }

  getTopAdvocates(startDate: Date, endDate: Date) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).set('teamId', '');
    return this.apiService.getData(this.dashboardApiEndPoints['topAdvocate'], 1, dateParams);
  }

  getTopBlurbsByDate(startDate: Date, endDate: Date) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.apiService.getData(this.dashboardApiEndPoints['topBlurbByDate'], 1, dateParams);
  }

  getSharesAndEngagements(provider: string, startDate: string, endDate: string, teamId?: string, categoryId?: string) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString())
      .set('categoryId', categoryId).set('teamId', teamId).set('provider', provider);
    return this.apiService.getData(this.dashboardApiEndPoints['granularSocialMediaAnalytics'], 1, dateParams);
  }

  getGranularEarnedMediaValueAnalytics(startDate: Date, endDate: Date) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.apiService.getData(this.dashboardApiEndPoints['granularEarnedMediaValueAnalytics'], 1, dateParams);

  }

  getEMVMetrics() {
    return this.apiService.getData(this.dashboardApiEndPoints['emvmetrics'], 1, null);
  }

  getGranularGoogleAnalytics(startDate: string, endDate: string, accountId: string, profileId: string, metric: string) {
    const httpHeaderParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).
      set('accountId', accountId).set('profileId', profileId).set('metric', metric);
    return this.apiService.getData(this.dashboardApiEndPoints['granularGoogleAnalytics'], 1, httpHeaderParams);
  }

  getGranularGoogleGoalAnalytics(startDate: string, endDate: string, accountId: string, profileId: string, goalId: string) {
    const httpHeaderParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).
      set('accountId', accountId).set('profileId', profileId).set('goalId', goalId);
    return this.apiService.getData(this.dashboardApiEndPoints['granularGoogleGoalAnalytics'], 1, httpHeaderParams);
  }

  getGoogleAnalyticsProfiles() {
    return this.apiService.getData(this.dashboardApiEndPoints['gooleAnalyticsProfiles'], 1);
  }

  getGoogleAnalyticsMetrics() {
    return this.apiService.getData(this.dashboardApiEndPoints['gooleAnalyticsMetrics'], 1);
  }

  getGoogleAnalyticsTraffic(startDate: string, endDate: string, accountId: string, profileId: string, metric: string) {
    const httpHeaderParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).
      set('accountId', accountId).set('profileId', profileId).set('metric', metric);
    return this.apiService.getData(this.dashboardApiEndPoints['googleAnalyticsTraffic'], 1, httpHeaderParams);
  }

  getGoogleAnalyticsTrafficInDetail(startDate: string, endDate: string, accountId: string, profileId: string, metric: string) {
    const httpHeaderParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).
      set('accountId', accountId).set('profileId', profileId).set('metric', metric);
    return this.apiService.getData(this.dashboardApiEndPoints['detailedGoogleAnalyticsTraffic'], 1, httpHeaderParams);
  }

  getGoogleAnalyticsGoals(accountId: string, profileId: string, userId: string) {
    const httpHeaderParams = new HttpParams().set('accountId', accountId).set('profileId', profileId).set('userId', userId);
    return this.apiService.getData(this.dashboardApiEndPoints['googleAnalyticsGoals'], 1, httpHeaderParams);
  }

  getDashboardTotals() {
    return this.apiService.getData(this.dashboardApiEndPoints['dashboardTotals'], 1, null)
  }

  getContentPerformanceAnalytics(startDate: Date, endDate: Date, type: string) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).set('analyticsType', type);
    return this.apiService.getData(this.dashboardApiEndPoints['contentPerformanceByDate'], 1, dateParams);
  }

  getPageviewTotals(startDate: Date, endDate: Date) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.apiService.getData(this.dashboardApiEndPoints['pageViewTotals'], 1, dateParams);
  }

  getContentViewMore(startDate: Date, endDate: Date) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.apiService.getData(this.dashboardApiEndPoints['contentAnalyticsViewMore'], 1, dateParams);
  }


  getUserDetails(startDate: Date, endDate: Date, blurbId: number) {
    const dateParams = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString()).set('BlurbId', blurbId.toString());
    return this.apiService.getData(this.dashboardApiEndPoints['userDetails'], 1, dateParams);
  }

}
