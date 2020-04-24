import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {

  isReferUserEnabledForAdvocates = true;
  isExternalRegisteration = true;
  isResetPointCriteriaAccepted = false;
  userRegisterLink: string;

  isUserSettingsLoading = false;
  isUserSettingsError = false;
  resetModalRef: NgbModalRef;
  isResetInprogress: boolean = false;

  constructor(private settingsService: SettingsService, private apiService: ApiService, private toastService: ToastService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.getUserSettings();
  }

  getUserSettings() {
    this.isUserSettingsLoading = true;
    this.isUserSettingsError = false;
    this.settingsService.getUserSettings().subscribe(
      (success) => { this.setUserSettings(success); },
      (error) => {
        this.apiService.handleApiException(error);
        this.isUserSettingsLoading = false;
        this.isUserSettingsError = true;
      }
    );
  }

  setUserSettings(response: any) {
    this.isReferUserEnabledForAdvocates = response.IsReferUserEnabledForAdvocates;
    this.isExternalRegisteration = !response.IsUseSocxoForUserInvite;
    this.userRegisterLink = response.UserRegisterLink;
    this.isUserSettingsLoading = false;
  }

  updateReferUserSettings() {
    this.settingsService.updateReferUserSettings(this.isReferUserEnabledForAdvocates).subscribe(
      (success) => {
        this.toastService.success('Refer user setting has been updated.');
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.toastService.error('Failed to update refer user setting.')
      }
    );
  }

  updateInviteMailSettings() {
    this.settingsService.updateInviteMailSettings(this.isExternalRegisteration).subscribe(
      (success) => {
        this.toastService.success('Invite mail setting has been updated.')
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.toastService.error('Failed to update invite email settings.')
      }
    );
  }

  copyLink(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.toastService.success('The external user register link copied');
  }

  resetUserPointPopUp(resetPointPlan) {
    this.resetModalRef = this.modalService.open(resetPointPlan, { size: 'lg' });
    this.resetModalRef.result.then((close) => {
      this.isResetPointCriteriaAccepted = false;
    },
      (dismiss) => {
        this.isResetPointCriteriaAccepted = false;
      });

  }

  resetUserPoint() {
    this.isResetInprogress = true;
    this.settingsService.resetUserPoints().subscribe(
      (success) => {
        this.isResetInprogress = false;
        this.showToastForResetPoint(success);
      },
      (error) => {
        this.isResetInprogress = false;
        this.apiService.handleApiException(error);
        this.toastService.error('Failed to reset user points.')
      }
    );
  }

  showToastForResetPoint(response: any) {
    if (response.status) {
      this.toastService.success('User points has been reset.');
    }
    else {
      this.toastService.error('Failed to reset user points.');
    }
  }
}
