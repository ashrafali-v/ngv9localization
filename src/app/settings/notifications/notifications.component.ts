import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../settings.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  isPushNotificationEnabledForBlurbs: boolean;
  isNewUserRegistrationNotificationEnabled: boolean;
  isSuggestedContentNotificationEnabled: boolean;
  isNewRedemptionRequestNotificationEnabled: boolean;
  isUpdatePushNotificationInProgress = false;
  isUpdateNewUserRegistrationNotificationInProgress = false;
  isUpdateSuggestedContentNotificationInProgress = false;
  isUpdateNewRedemptionRequestNotificationInProgress = false;
  private subs = new SubSink();

  constructor(private settingsService: SettingsService, private apiService: ApiService,
    private toastService: ToastService) { }

  ngOnInit() {
    this.getNotificationSettings();
  }

  getNotificationSettings() {
    this.subs.sink = this.settingsService.getNotificationSettings(localStorage.getItem("Username")).subscribe(
      (success) => { this.setNotificationSettings(success); },
      (error) => { this.showError(error, 'An error occurred while fetching the notification settings!'); }
    );
  }

  setNotificationSettings(data: any) {
    if (data != null) {
      this.isPushNotificationEnabledForBlurbs = data.IsPushNotificationEnabledForBlurbs;
      this.isNewUserRegistrationNotificationEnabled = data.IsNewUserRegistrationNotificationEnabled;
      this.isSuggestedContentNotificationEnabled = data.IsSuggestedContentNotificationEnabled;
      this.isNewRedemptionRequestNotificationEnabled = data.IsNewRedemptionRequestNotificationEnabled;
    }
  }

  showError(error: HttpErrorResponse, errorMessageToBeDisplayed: string) {
    this.apiService.handleApiException(error);
    this.toastService.error(errorMessageToBeDisplayed);
  }

  updatePushNotification() {
    // Updates the push notification setting on the button toggle.
    this.isUpdatePushNotificationInProgress = true;
    this.subs.sink = this.settingsService.updateNotificationSettings('PushNotification', this.isPushNotificationEnabledForBlurbs,
      localStorage.getItem("Username")).subscribe(
        (success) => {
          this.isUpdatePushNotificationInProgress = false;
          this.toastService.success("Push notifications setting has been updated.")
        },
        (error) => {
          this.isUpdatePushNotificationInProgress = false;
          this.isPushNotificationEnabledForBlurbs = !this.isPushNotificationEnabledForBlurbs;
          this.showError(error, 'Failed to update push notification setting.');
        }
      );
  }

  updateUserRegistrationNotificationSetting() {
    // Updates the new user registration notification setting on the button toggle.
    this.isUpdateNewUserRegistrationNotificationInProgress = true;
    this.subs.sink = this.settingsService.updateNotificationSettings('EnabledNewUserNotification', this.isNewUserRegistrationNotificationEnabled,
      localStorage.getItem("Username")).subscribe(
        (success) => {
          this.isUpdateNewUserRegistrationNotificationInProgress = false;
          this.toastService.success("Email notification setting has been updated.")
        },
        (error) => {
          this.isUpdateNewUserRegistrationNotificationInProgress = false;
          this.isNewUserRegistrationNotificationEnabled = !this.isNewUserRegistrationNotificationEnabled;
          this.showError(error, 'Failed to update email notification setting.');
        }
      );
  }

  updateSuggestedContentNotificationSetting() {
    // Updates the suggested content notification setting on the button toggle.
    this.isUpdateSuggestedContentNotificationInProgress = true;
    this.subs.sink = this.settingsService.updateNotificationSettings('EnabledSuggestedContentNotification', this.isSuggestedContentNotificationEnabled,
      localStorage.getItem("Username")).subscribe(
        (success) => {
          this.isUpdateSuggestedContentNotificationInProgress = false;
          this.toastService.success("Email notification setting has been updated.")
        },
        (error) => {
          this.isUpdateSuggestedContentNotificationInProgress = false;
          this.isSuggestedContentNotificationEnabled = !this.isSuggestedContentNotificationEnabled;
          this.showError(error, 'Failed to update email notification setting.');
        }
      );
  }

  updateNewRedemptionRequestNotificationSetting() {
    // Updates the new redemption request notification setting on the button toggle.
    this.isUpdateNewRedemptionRequestNotificationInProgress = true;
    this.subs.sink = this.settingsService.updateNotificationSettings('EnabledRedeemRequestNotification', this.isNewRedemptionRequestNotificationEnabled,
      localStorage.getItem("Username")).subscribe(
        (success) => {
          this.isUpdateNewRedemptionRequestNotificationInProgress = false;
          this.toastService.success("Email notification setting has been updated.")
        },
        (error) => {
          this.isUpdateNewRedemptionRequestNotificationInProgress = false;
          this.isNewRedemptionRequestNotificationEnabled = !this.isNewRedemptionRequestNotificationEnabled;
          this.showError(error, 'Failed to update email notification setting.');
        }
      );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
