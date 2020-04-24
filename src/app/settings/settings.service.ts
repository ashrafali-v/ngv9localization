import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { SMTPConfigurations } from './models/SMTPConfigurations';
import { Team } from './Models/Team';
import { TeamContentSource } from './Models/TeamContentSource';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settingsApiEndpoints = {
    //Notification settings
    GetNotificationSettings: 'settings/getnotificationsettings',
    SetNotificationSettings: 'settings/setnotificationsettings',

    //Configuration settings
    GetSMTPConfigurations: 'settings/getsmtpconfigurations',
    SetSMTPConfigurations: 'settings/setsmtpconfigurations',
    ResetSMTPConfigurations: 'settings/resetsmtpconfigurations',
    ActivateSMTPConfigurations: 'settings/activatesmtpconfigurations',

    SAMLSettings: 'settings/samlsettings',
    UpdateSAMLSettings: 'settings/updatesamlsettings',

    PasswordSettings: 'settings/getpasswordexpirysettings',
    setPasswordExpiry: 'settings/setpasswordExpiry',
    setPasswordComplexity: 'settings/setpasswordcomplexity',

    //Team settings
    GetTeamSettings: 'settings/getteamsettings',
    GetUserCountForTeam: 'settings/usercountforteam',
    GetUserListForTeam: 'settings/userlistforteam',
    GetContentSourceListForTeams: 'settings/contentsourcelistforteam',
    CreateTeam: 'settings/createteam',
    EditTeam: 'settings/updateteam',
    DeleteTeam: 'settings/deleteteam',

    //Category settings
    GetCategories: 'settings/GetCategory',
    SaveCategory: 'settings/SaveCategory',
    EnableCategory: 'settings/EnableCategory',
    AssociatedContentSources: 'settings/AssociatedContentSourcesCategory',
    EnableCategoryList: 'settings/GetEnableCategoryList',
    DisableCategory: 'settings/DisableCategory',

    //Point settings
    ChannelPointplan: "settings/getpointplan",
    Fetchpointplanfeedandblurbs: "settings/fetchpointplanfeedandblurbs",
    EditPointPlan: "settings/getpointplanbyid",
    SavePointPlan: "settings/savepointplan",
    DeletePointPlan: "settings/deletepointplan",
    CopyPointplan: "settings/copypointplan",
    DefaultPointPlan: "settings/getdefaultpointplan",
    EnableDisablePointPlan: "settings/enableordisablepointplan",
    Saveregularandonetime: "settings/saveregularandonetime",
    Setasdefaultpointplan: "settings/setasdefaultpointplan",
    Exportpointplan: "settings/exportpointplan",
    ExportPointPlanContentSource: 'settings/exportpointplancontentsource',
    ExportPointPlanContent: 'settings/exportpointplancontent',

    //Channel settings
    GetConnectedSocialMediaAccountCount: 'settings/getconnectedsocialmediaaccountcount',
    GetConnectedSocialMediaAccountsAndPageCount: 'settings/getconnectedsocialmediaaccountsandpagecount',
    GetConnectedPagesInASocialMediaAccount: 'settings/getconnectedpagesinasocialmediaaccount',
    GetFeedsAssociatedWithAccount: 'settings/getfeedsassociatedwithaccount',
    GetFeedsAssociatedWithPage: 'settings/getfeedsassociatedwithpage',
    ConnectSocialMediaAccount: 'settings/connectsocialmediaaccount',
    EnableOrDisableSocialMediaPage: 'settings/enableordisablesocialmediapage',
    DeleteSocialMediaAccount: 'settings/deletesocialmediaaccount',
    DeleteSocialMediaPage: 'settings/deletesocialmediapage',
    RefreshSocialMediaPages: 'settings/refreshsocialmediapages',
    NotifySocialMediaAccountOwner: 'settings/notifysocialmediaaccountowner',

    //User settings
    GetUserSettings: 'settings/getusersettings',
    UpdateReferUserSettings: 'settings/updatereferusersettings',
    UpdateInviteMailSettings: 'settings/updateinvitemailsettings',
    ResetUserPoints: 'settings/resetuserpoints',

    //Content settings
    GetContentSettings: 'settings/getcontentsettings',
    UpdateContentSettings: 'settings/updatecontentsettings',
    SharingControls: "settings/sharingcontrols",
    ModifySharingControl: "settings/modifysharingcontrol",

    //Analytics settings
    GetPlatformAnalyticsSettings: 'settings/getplatformanalyticssettings',
    GetEarnedMediaValueSettings: 'settings/getearnedmediavaluesettings',
    UpdateAnalyticsTrafficSettings: 'settings/updateanalyticstrafficsettings',
    UpdateEarnedMediaValueSettings: 'settings/updateearnedmediavaluesettings',

    GetGoogleAnalyticsAccountsAndProfiles: 'settings/getgoogleanalyticsaccounts',
    EnableOrDisableGoogleAnalyticsProfile: 'settings/enableordisablegoogleanalyticsprofile',
    DeleteGoogleAnalyticsAccount: 'settings/deletegoogleanalyticsaccount',
    ConnectGoogleAnalytics: 'settings/connectgoogleanalytics',
    UpdateUTMPatameters: 'settings/updateutmparameters'
  };

  constructor(private apiService: ApiService) { }

  //#region Notification settings
  getNotificationSettings(username: string) {
    const httpHeaderParams = new HttpParams().set('userName', username);
    return this.apiService.getData(this.settingsApiEndpoints['GetNotificationSettings'], 1, httpHeaderParams);
  }

  updateNotificationSettings(notificationSettingName: string, notificationSettingValue: boolean, username: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', username).set('notificationSettingName', notificationSettingName)
      .set('notificationSettingValue', notificationSettingValue.toString());
    return this.apiService.postData(this.settingsApiEndpoints['SetNotificationSettings'], null, headers, 1, httpHeaderParams);
  }

  //#endregion

  //#region Configuration settings
  getSMTPConfigurations() {
    return this.apiService.getData(this.settingsApiEndpoints['GetSMTPConfigurations'], 1);
  }

  updateSMTPConfigurations(smtpConfig: SMTPConfigurations, username: string, resendEmail: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', username).set('resendEmail', resendEmail.toString());
    return this.apiService.postData(this.settingsApiEndpoints['SetSMTPConfigurations'], smtpConfig, headers, 1, httpHeaderParams);
  }

  resetSMTPConfigurations() {
    return this.apiService.postData(this.settingsApiEndpoints['ResetSMTPConfigurations'], null, null, 1, null);
  }

  activateSMTPConfigurations(activationToken: string) {
    const httpHeaderParams = new HttpParams().set('activationToken', activationToken);
    return this.apiService.postData(this.settingsApiEndpoints['ActivateSMTPConfigurations'], null, null, 1, httpHeaderParams);
  }

  getSAMLAuthenticationSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['SAMLSettings'], 1);
  }

  setSAMLAuthenticationSettings(samlAuthData, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['UpdateSAMLSettings'], samlAuthData, headers, 1, httpHeaderParams);
  }

  getPasswordSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['PasswordSettings'], 1);
  }
  setPasswordExpiry(passwordExpiry, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['setPasswordExpiry'], passwordExpiry, headers, 1, httpHeaderParams);

  }
  setPasswordComplexity(passwordComplexitySettings, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['setPasswordComplexity'], passwordComplexitySettings, headers, 1, httpHeaderParams);
  }

  //#endregion

  //#region Team Settings
  getTeamSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['GetTeamSettings'], 1);
  }

  getUserCountForTeam(teamId: number) {
    const httpHeaderParams = new HttpParams().set('teamId', teamId.toString());
    return this.apiService.getData(this.settingsApiEndpoints['GetUserCountForTeam'], 1, httpHeaderParams);
  }

  getUserListForTeam(teamId: number) {
    const httpHeaderParams = new HttpParams().set('teamId', teamId.toString());
    return this.apiService.getData(this.settingsApiEndpoints['GetUserListForTeam'], 1, httpHeaderParams);
  }

  getContentSourceListForTeams(teamId: number) {
    const httpHeaderParams = new HttpParams().set('teamId', teamId.toString());
    return this.apiService.getData(this.settingsApiEndpoints['GetContentSourceListForTeams'], 1, httpHeaderParams);
  }

  createTeam(team: Team, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['CreateTeam'], team, headers, 0, httpHeaderParams);
  }

  editTeam(team: Team, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['EditTeam'], team, headers, 0, httpHeaderParams);
  }

  deleteTeam(teamId: number, userTeamId: number, teamContentSourceList: Array<TeamContentSource>, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userTeamId', userTeamId.toString())
      .set('userName', userName)
      .set('teamId', teamId.toString());

    // Using httpPost - we need to pass the contentsource list for re-assigning the teams.
    return this.apiService.postData(this.settingsApiEndpoints['DeleteTeam'], teamContentSourceList, headers, 0, httpHeaderParams);
  }

  //#endregion

  //#region Category settings
  getCategories() {
    return this.apiService.getData(this.settingsApiEndpoints['GetCategories'], 1);
  }

  saveCategory(category, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['SaveCategory'], category, headers, 1, httpHeaderParams);
  }

  enbaleCategory(category, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['EnableCategory'], category, headers, 1, httpHeaderParams);
  }

  getAssociatedContentSources(categoryId: string) {
    const httpHeaderParams = new HttpParams().set('categoryId', categoryId);
    return this.apiService.getData(this.settingsApiEndpoints['AssociatedContentSources'], 1, httpHeaderParams);
  }

  getEnableCategoryList(categoryId: string) {
    const httpHeaderParams = new HttpParams().set('categoryId', categoryId);
    return this.apiService.getData(this.settingsApiEndpoints['EnableCategoryList'], 1, httpHeaderParams);
  }

  disableCategory(feedCategories, categoryId: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('categoryId', categoryId);
    return this.apiService.postData(this.settingsApiEndpoints['DisableCategory'], feedCategories, headers, 1, httpHeaderParams);
  }

  //#endregion

  //#region Point plan settings
  getPointPlan(): Observable<any> {
    return this.apiService.getData(this.settingsApiEndpoints['ChannelPointplan'], 1);
  }

  getContentSourceList(pointPlanId): Observable<any> {
    const httpHeaderParams = new HttpParams().set('pointPlanId', pointPlanId);
    return this.apiService.getData(this.settingsApiEndpoints['Fetchpointplanfeedandblurbs'], 1, httpHeaderParams);
  }

  editPointPlan(Id: any): Observable<any> {
    const httpHeaderParams = new HttpParams().set('pointPlanId', Id);
    return this.apiService.getData(this.settingsApiEndpoints['EditPointPlan'], 1, httpHeaderParams);
  }

  savePointPlan(point: any, userName: string): Observable<any> {
    let PointPlan = Object.keys(point.PointPlan).map(function (ele) {
      let plan = point.PointPlan[ele];
      return plan;
    })
    point.PointPlan = PointPlan;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['SavePointPlan'], point, headers, 0, httpHeaderParams);
  }

  deletePointPlan(Id: any) {
    const httpHeaderParams = new HttpParams().set('pointPlanId', Id);
    return this.apiService.deleteData(this.settingsApiEndpoints['DeletePointPlan'], null, 1, httpHeaderParams);
  }

  copyPointPlan(pointplan: string): Observable<any> {
    const httpHeaderParams = new HttpParams().set('pointPlanId', pointplan);
    return this.apiService.getData(this.settingsApiEndpoints['CopyPointplan'], 1, httpHeaderParams);
  }

  createPointPlan(): Observable<any> {
    return this.apiService.getData(this.settingsApiEndpoints['DefaultPointPlan'], 1);
  }

  enableDisablePointPlan(Id: any, status: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('pointPlanId', Id).set('value', status);
    return this.apiService.postData(this.settingsApiEndpoints['EnableDisablePointPlan'], null, headers, 0, httpHeaderParams);
  }

  saveRegularAndOnetime(result: any): Observable<any> {
    let PointPlan: any;
    if (result.Regular == undefined) {
      PointPlan = Object.keys(result.OneTime).map(function (ele) {
        let plan = result.OneTime[ele];
        return plan;
      });
      result.OneTime = PointPlan;
    }
    else {
      PointPlan = Object.keys(result.Regular).map(function (ele) {
        let plan = result.Regular[ele];
        return plan;
      });
      result.Regular = PointPlan;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams();
    return this.apiService.postData(this.settingsApiEndpoints['Saveregularandonetime'], PointPlan, headers, 0, httpHeaderParams);
  }

  setasDefaultPointPlan(pointPlanId: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('pointPlanId', pointPlanId);
    return this.apiService.postData(this.settingsApiEndpoints['Setasdefaultpointplan'], null, headers, 0, httpHeaderParams);
  }

  exportPointPlan(pointPlanId: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data' });
    const httpHeaderParams = new HttpParams().set('pointPlanId', pointPlanId);
    return this.apiService.getFormData(this.settingsApiEndpoints['Exportpointplan'], headers, 0, httpHeaderParams);
  }

  exportPointPlanContentSource(pointPlanId: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data' });
    const httpHeaderParams = new HttpParams().set('pointPlanId', pointPlanId);
    return this.apiService.getFormData(this.settingsApiEndpoints['ExportPointPlanContentSource'], headers, 0, httpHeaderParams);
  }

  exportPointPlanContent(pointPlanId: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data' });
    const httpHeaderParams = new HttpParams().set('pointPlanId', pointPlanId);
    return this.apiService.getFormData(this.settingsApiEndpoints['ExportPointPlanContent'], headers, 0, httpHeaderParams);
  }

  //#endregion

  //#region Channel settings
  getConnectedSocialMediaAccountCount() {
    return this.apiService.getData(this.settingsApiEndpoints['GetConnectedSocialMediaAccountCount'], 1);
  }

  getConnectedSocialMediaAccountsAndPageCount(provider: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider);
    return this.apiService.getData(this.settingsApiEndpoints['GetConnectedSocialMediaAccountsAndPageCount'], 1, httpHeaderParams);
  }

  getConnectedPagesInSocialMediaAccount(provider: string, providerUserId: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerUserId', providerUserId);
    return this.apiService.getData(this.settingsApiEndpoints['GetConnectedPagesInASocialMediaAccount'], 1, httpHeaderParams);
  }

  getFeedsAssociatedWithAccount(provider: string, providerUserId: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerUserId', providerUserId);
    return this.apiService.getData(this.settingsApiEndpoints['GetFeedsAssociatedWithAccount'], 1, httpHeaderParams);
  }

  getFeedsAssociatedWithPage(provider: string, pageId: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('pageId', pageId);
    return this.apiService.getData(this.settingsApiEndpoints['GetFeedsAssociatedWithPage'], 1, httpHeaderParams);
  }

  connectSocialMediaAccount(provider: string, username: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('username', username);
    return this.apiService.getData(this.settingsApiEndpoints['ConnectSocialMediaAccount'], 1, httpHeaderParams);
  }

  enableOrDisableAPageInSocialMediaAccount(provider: string, providerUserId: string, pageId: string, status: boolean) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerId', providerUserId).
      set('pageId', pageId).set('status', status.toString());
    return this.apiService.patchData(this.settingsApiEndpoints['EnableOrDisableSocialMediaPage'], null, null, 1, httpHeaderParams);
  }

  deleteSocialMediaAccount(provider: string, providerUserId: string, providerUsername: string, username: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerUserId', providerUserId).
      set('providerUsername', providerUsername).set('username', username);
    return this.apiService.deleteData(this.settingsApiEndpoints['DeleteSocialMediaAccount'], null, 1, httpHeaderParams);
  }

  deleteSocialMediaPage(provider: string, providerUserId: string, pageId: string, pageName: string, username: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerUserId', providerUserId).
      set('pageId', pageId).set('pageName', pageName).set('username', username);
    return this.apiService.deleteData(this.settingsApiEndpoints['DeleteSocialMediaPage'], null, 1, httpHeaderParams);
  }

  refreshSocialMediaPages(provider: string, providerUserId: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerUserId', providerUserId);
    return this.apiService.getData(this.settingsApiEndpoints['RefreshSocialMediaPages'], 1, httpHeaderParams);
  }

  notifySocialMediaAccountExpiry(provider: string, providerUsername: string,
    notifiedUsername: string, notifyingUsername: string) {
    const httpHeaderParams = new HttpParams().set('provider', provider).set('providerUsername', providerUsername).
      set('notifiedUsername', notifiedUsername).set('notifyingUsername', notifyingUsername);
    return this.apiService.getData(this.settingsApiEndpoints['NotifySocialMediaAccountOwner'], 1, httpHeaderParams);
  }

  //#endregion

  //#region  User settings
  getUserSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['GetUserSettings'], 1);
  }

  updateReferUserSettings(isReferUserEnabledForAdvocates: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('isReferUserEnabledForAdvocates', isReferUserEnabledForAdvocates.toString());
    return this.apiService.postData(this.settingsApiEndpoints['UpdateReferUserSettings'], null, headers, 1, httpHeaderParams);
  }

  updateInviteMailSettings(isUseSocxoForUserInvite: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('isUseSocxoForUserInvite', isUseSocxoForUserInvite.toString());
    return this.apiService.postData(this.settingsApiEndpoints['UpdateInviteMailSettings'], null, headers, 1, httpHeaderParams);
  }

  resetUserPoints() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.postData(this.settingsApiEndpoints['ResetUserPoints'], null, headers, 1, null);
  }

  //#endregion

  //#region Content settings
  getContentSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['GetContentSettings'], 1);
  }

  updateContentSettings(contentSettingName: string, contentSettingValue: string, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('contentSettingName', contentSettingName).set('contentSettingValue', contentSettingValue)
      .set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['UpdateContentSettings'], null, headers, 0, httpHeaderParams);
  }

  getSharingControls() {
    return this.apiService.getData(this.settingsApiEndpoints['SharingControls'], 1);
  }

  modifySharingControl(controls: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams();
    return this.apiService.postData(this.settingsApiEndpoints['ModifySharingControl'], controls, headers, 0, httpHeaderParams);
  }
  //#endregion

  //#region Analytics settings
  getPlatformAnalyticsSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['GetPlatformAnalyticsSettings'], 1);
  }

  getEarnedMediaValueSettings() {
    return this.apiService.getData(this.settingsApiEndpoints['GetEarnedMediaValueSettings'], 1);
  }

  updateAnalyticsTrafficSettings(contentSettingName: string, contentSettingValue: string, userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('trafficSettingName', contentSettingName).set('trafficSettingValue', contentSettingValue)
      .set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['UpdateAnalyticsTrafficSettings'], null, headers, 0, httpHeaderParams);
  }

  updateEarnedMediaValueSettings(earnedMediaValueSettings: any[], userName: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpHeaderParams = new HttpParams().set('userName', userName);
    return this.apiService.postData(this.settingsApiEndpoints['UpdateEarnedMediaValueSettings'], earnedMediaValueSettings, headers, 0, httpHeaderParams);
  }

  getGoogleAnalyticsAccountsAndProfiles() {
    return this.apiService.getData(this.settingsApiEndpoints['GetGoogleAnalyticsAccountsAndProfiles'], 1);
  }

  enableOrDisableGoogleAnalyticsProfile(profileId: string, status: boolean) {
    const httpHeaderParams = new HttpParams().set('profileId', profileId).set('status', status.toString());
    return this.apiService.patchData(this.settingsApiEndpoints['EnableOrDisableGoogleAnalyticsProfile'], null, null, 1, httpHeaderParams);
  }

  deleteGoogleAnalyticsAccount(googleAnalyticsAccountId: string) {
    const httpHeaderParams = new HttpParams().set('googleAnalyticsAccountId', googleAnalyticsAccountId);
    return this.apiService.deleteData(this.settingsApiEndpoints['DeleteGoogleAnalyticsAccount'], null, 1, httpHeaderParams);
  }

  connectGoogleAnalytics(username: string) {
    const httpHeaderParams = new HttpParams().set('username', username);
    return this.apiService.getData(this.settingsApiEndpoints['ConnectGoogleAnalytics'], 1, httpHeaderParams);
  }

  updateUtmParameters(campaignName: string, campaignMedium: string) {
    const httpHeaderParams = new HttpParams().set('campaignName', campaignName).set('campaignMedium', campaignMedium);
    return this.apiService.patchData(this.settingsApiEndpoints['UpdateUTMPatameters'], null, null, 1, httpHeaderParams);
  }

  // #endregion 

}
