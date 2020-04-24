import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { ToastService } from 'src/app/services/toast.service';
import { ApiService } from 'src/app/services/api.service';
import { SubSink } from 'subsink';
import { EarnedMediaValue } from '../Models/EarnedMediaValue';
import { GoogleAnalyticsAccount, GoogleAnalyticsProfile } from '../Models/GoogleAnalytics';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {

  utmForm: FormGroup;
  utmFormSubmitted: boolean;
  savingUtmInProgress: boolean;
  initialLoadSuccess = true;
  googleAnalyticsAccounts: any = [];
  gaListCurrentPage = 1;
  gaListPageSize = 10;
  noGAAccountsToDisplay: boolean;
  gaSearchText: string;
  isGAListLoading: boolean;
  isProfileListLoading: boolean;
  selectedProfile: GoogleAnalyticsProfile;
  selectedAccount: GoogleAnalyticsAccount;
  enableOrDisableTextForSelectedProfile: string;
  removeModalRef: NgbModalRef;
  enableOrDisableProfileInProgress: boolean;
  googleAnalyticsAccountRemovalInProgress: boolean;
  selectedAccountIndex: number;
  selectedProfileIndex: number;

  //Conversion settings
  conversionCode: string;
  imageConversionCode: string;

  //Traffic settings
  isRedirectToLandingPage: boolean = false;
  isShortUrlEnabledForReshare: boolean = true;

  //Earned media value settings 
  earnedMediaValue: any = [];
  editEarnedMediaValueModalRef: NgbModalRef;
  enableEarnedMediaValueEditing = true;
  editEarnedMediaValueSubmitted = false;

  //Platform and earned media value load status
  isPlatformAnalyticsLoadError: boolean = false;
  isPlatformAnalyticsLoading: boolean = false;
  isEarnedMediaSettingsLoading: boolean = false;
  isEarnedMediaSettingsLoadError: boolean = false;

  currentUserName = localStorage.getItem("Username");
  private observableSubscriptions = new SubSink();

  constructor(private settingsService: SettingsService, private toastService: ToastService, private apiService: ApiService,
    private modalService: NgbModal, private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildUtmForm();
    this.utmForm.disable();
    this.observableSubscriptions.sink = this.route.queryParams.subscribe(
      params => {
        if (params != null && params != undefined) {
          if (params.success != null && params.success != null) {
            if (params.success == 'True') {
              this.toastService.success('Google analytics account has been connected.');
            }
            else if (params.success == 'False') {
              this.toastService.error('Failed to connecto to google analytics. Please ensure the association of google analytics to the account you are trying to connect.');
            }
          }
          this.router.navigate(['settings/analytics']);
        }
      }
    );

    this.getGoogleAnalticsAccountsAndProfiles();
    this.getPlatformAnalyticsAndEarnedMedia();
  }

  getGoogleAnalticsAccountsAndProfiles() {
    this.isGAListLoading = true;
    this.observableSubscriptions.sink = this.settingsService.getGoogleAnalyticsAccountsAndProfiles().subscribe(
      (success: any) => {
        if (success != null && success != undefined) {
          success.gaAccounts.forEach(account => {
            let googleAnalyticsAccount = new GoogleAnalyticsAccount();
            googleAnalyticsAccount.GoogleAnalyticsAccountId = account.GoogleAnalyticsAccountId;
            googleAnalyticsAccount.GoogleAnalyticsAccountName = account.GoogleAnalyticsAccountName;
            googleAnalyticsAccount.GoogleAccountUserName = account.GoogleAccountUserName;
            googleAnalyticsAccount.GoogleAccountUserImageUrl = account.GoogleAccountUserImageUrl;
            googleAnalyticsAccount.IsEnabled = account.IsEnabled;
            googleAnalyticsAccount.ProfileCount = account.ProfileCount;
            googleAnalyticsAccount.IsExpanded = false;
            if (googleAnalyticsAccount.ProfileCount > 0) {
              googleAnalyticsAccount.GoogleAnalyticsProfiles = [];
              account.GoogleAnalyticsProfiles.forEach(profile => {
                let googleAnalyticsProfile = new GoogleAnalyticsProfile();
                googleAnalyticsProfile.ProfileId = profile.ProfileId;
                googleAnalyticsProfile.ProfileName = profile.ProfileName;
                googleAnalyticsProfile.WebsiteUrl = profile.WebsiteUrl;
                googleAnalyticsProfile.IsEnabled = profile.IsEnabled;
                googleAnalyticsAccount.GoogleAnalyticsProfiles.push(googleAnalyticsProfile);
              });
            }
            this.googleAnalyticsAccounts.push(googleAnalyticsAccount);
          });
        }

        this.noGAAccountsToDisplay = this.googleAnalyticsAccounts.length == 0 ? true : false;
        if (this.googleAnalyticsAccounts.length > 0) {
          this.utmForm.patchValue({
            campaignName: success.utmParameters.CampaignName,
            campaignMedium: success.utmParameters.CampaignMedium
          });
        }
        this.isGAListLoading = false;
      },
      error => {
        this.initialLoadSuccess = false;
        this.isGAListLoading = false;
        this.apiService.handleApiException(error);
      }
    );
  }

  buildUtmForm() {
    this.utmForm = this.formBuilder.group({
      campaignName: ['', [Validators.required, Validators.maxLength(25), Validators.pattern('^[a-zA-Z0-9.]+$')]],
      campaignMedium: ['', [Validators.required, Validators.maxLength(25), Validators.pattern('^[a-zA-Z0-9.]+$')]]
    });
  }

  utmFormControl() {
    return this.utmForm.controls;
  }

  updateUtmParameters() {
    this.utmFormSubmitted = true;
    if (this.utmForm.valid) {
      this.savingUtmInProgress = true;
      this.observableSubscriptions.sink = this.settingsService.updateUtmParameters(
        this.utmForm.value.campaignName, this.utmForm.value.campaignMedium).subscribe(
          success => {
            this.toastService.success("Utm parameters have been updated.");
            this.savingUtmInProgress = false;
          },
          error => {
            this.handleException(error, 'Failed to update utm parameters.');
            this.savingUtmInProgress = false;
          }
        );

      this.utmForm.disable();
    }
  }

  listConnectedProfiles(googleAnalyticsAccountId: string, toggleTable: boolean) {
    this.isProfileListLoading = true;
    if (toggleTable) {
      this.googleAnalyticsAccounts.forEach(element => {
        // Setting the collapse/expand for page list.
        if (element.googleAnalyticsAccountId == googleAnalyticsAccountId) {
          element.IsExpanded = !element.IsExpanded;
        } else {
          element.IsExpanded = false;
        }
      });
    }
    else {
      this.googleAnalyticsAccounts.forEach(element => {
        // This is the case when called after refreshing the pages. The refreshed account has to
        // display the pages so the table needs to be in expanded state
        if (element.googleAnalyticsAccountId == googleAnalyticsAccountId) {
          element.IsExpanded = true;
        } else {
          element.IsExpanded = false;
        }
      });
    }

    this.isProfileListLoading = false;
  }

  showGoogleAnalyticsConnectionModal(templateName) {
    this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  connectGoogleAnalytics() {
    this.observableSubscriptions.sink = this.settingsService.connectGoogleAnalytics(this.currentUserName)
    .subscribe(
      (success: any) => {
        window.location.href = encodeURI(success);
      },
      error => {
        this.toastService.error("Failed to connect to google analytics.");
      }
    );
  }

  showEnableOrDisableProfile(profile: GoogleAnalyticsProfile, accountIndex: number,
    profileIndex: number, templateName) {
    this.selectedAccountIndex = accountIndex;
    this.selectedProfileIndex = profileIndex;
    this.selectedProfile = profile;
    this.enableOrDisableTextForSelectedProfile = profile.IsEnabled ? 'Disable' : 'Enable';
    this.removeModalRef = this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false, scrollable: true });
  }

  showDeleteAccount(account: GoogleAnalyticsAccount, accountIndex: number, templateName) {
    this.selectedAccountIndex = accountIndex;
    this.selectedAccount = account;
    this.removeModalRef = this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false, scrollable: true });
  }

  enableOrDisableGoogleAnalyticsProfile() {
    this.enableOrDisableProfileInProgress = true;
    this.observableSubscriptions.sink = this.settingsService.enableOrDisableGoogleAnalyticsProfile(this.selectedProfile.ProfileId,
      !this.selectedProfile.IsEnabled).subscribe(
        success => {
          this.googleAnalyticsAccounts[this.selectedAccountIndex].GoogleAnalyticsProfiles[this.selectedProfileIndex].
            IsEnabled = !this.selectedProfile.IsEnabled;
          this.removeModalRef.close();
          this.enableOrDisableProfileInProgress = false;
          this.toastService.success('Google analytics profile has been updated.');
        },
        error => {
          let errMessage = '';
          if (error.status === 401) {
            errMessage = 'You cannot add or enable profiles any more since you have reached the maxmimum limit.';
          } else {
            errMessage = 'Failed to update google analytics profile.';
          }
          this.removeModalRef.close();
          this.enableOrDisableProfileInProgress = false;
          this.handleException(error, errMessage);
        }
      );
  }

  removeGoogleAnalyticsAccount() {
    this.googleAnalyticsAccountRemovalInProgress = true;
    this.observableSubscriptions.sink = this.settingsService.deleteGoogleAnalyticsAccount(this.selectedAccount.GoogleAnalyticsAccountId).
      subscribe(
        success => {
          this.googleAnalyticsAccounts.splice(this.selectedAccountIndex);
          this.removeModalRef.close();
          this.toastService.success('Google analytics account has been deleted.');
          this.noGAAccountsToDisplay = this.googleAnalyticsAccounts.length == 0 ? true : false;
        },
        error => {
          this.removeModalRef.close();
          this.handleException(error, 'Failed to delete google analytics account.');
        }
      );

    this.googleAnalyticsAccountRemovalInProgress = true;
  }


  //Platform analytics and Earned media value
  getPlatformAnalyticsAndEarnedMedia() {
    this.isPlatformAnalyticsLoadError = false;
    this.isPlatformAnalyticsLoading = true;
    this.isEarnedMediaSettingsLoadError = false;
    this.isEarnedMediaSettingsLoading = true;
    this.settingsService.getPlatformAnalyticsSettings().subscribe(
      (success) => {
        this.setPlatformAnalyticsAndEarnedMedia(success);
      },
      (error) => {
        this.isPlatformAnalyticsLoadError = true;
        this.isPlatformAnalyticsLoading = false;
        this.isEarnedMediaSettingsLoading = false;
        this.isEarnedMediaSettingsLoadError = false;
        this.apiService.handleApiException(error);
      }
    );
  }

  setPlatformAnalyticsAndEarnedMedia(response) {
    //Conversion settings
    this.conversionCode = response.ConversionCodes.ConversionCode;
    this.imageConversionCode = response.ConversionCodes.ImageConversionCode;

    //Traffic settings
    this.isRedirectToLandingPage = response.RedirectToLandingPage;
    this.isShortUrlEnabledForReshare = response.IsAppendShortURLEnabled;

    //Earned media value settings
    this.setEarnedMediaValue(response.EarnedMediaValue);
  }

  copyLinkForConversionCodes(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.toastService.success('The conversion code copied.');
  }

  updateTrafficSettingsSettings(trafficSettingName: string, trafficSettingValue: boolean) {
    this.observableSubscriptions.add(this.settingsService.updateAnalyticsTrafficSettings(trafficSettingName, trafficSettingValue.toString(), this.currentUserName).subscribe(
      (success) => {
        this.toastService.success('Traffic setting has been updated.');
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.toastService.error('Failed to update traffic setting.')
      }
    ));
  }

  getEarnedMediaValueSettings() {
    this.isEarnedMediaSettingsLoadError = false;
    this.isEarnedMediaSettingsLoading = true;
    this.observableSubscriptions.add(this.settingsService.getEarnedMediaValueSettings().subscribe(
      (success) => {
        this.setEarnedMediaValue(success);
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.isPlatformAnalyticsLoadError = true;
        this.isEarnedMediaSettingsLoading = false;
      }
    ));
  }

  setEarnedMediaValue(response) {
    this.earnedMediaValue = [];
    response.forEach(element => {
      var earnedMediaValueModel = new EarnedMediaValue();
      earnedMediaValueModel.ActionValueId = element.ActionValueId;
      earnedMediaValueModel.DisplayName = element.DisplayName;
      earnedMediaValueModel.Name = element.Name;
      earnedMediaValueModel.Value = element.Value;
      this.earnedMediaValue.push(earnedMediaValueModel);
    });
    this.isEarnedMediaSettingsLoading = false;
    this.isEarnedMediaSettingsLoadError = false;
  }

  editEarnedMediaValuePopUp(editEmv) {
    this.editEarnedMediaValueSubmitted = false;
    this.editEarnedMediaValueModalRef = this.modalService.open(editEmv, { size: 'lg', scrollable: true, backdrop: 'static' });
  }

  updateEarnedMediaValue(value: []) {
    var emvSettings = Object.keys(value).map(function (ele) {
      let plan = value[ele];
      return plan;
    })
    this.editEarnedMediaValueSubmitted = true;
    this.observableSubscriptions.add(this.settingsService.updateEarnedMediaValueSettings(emvSettings, this.currentUserName).subscribe(
      (success) => {
        this.editEarnedMediaValueModalRef.close();
        this.getEarnedMediaValueSettings();
        this.editEarnedMediaValueSubmitted = false;
        this.toastService.success('Earned media value has been updated.');
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.editEarnedMediaValueSubmitted = false;
        this.toastService.error('Failed to update earned media value.');
      }
    ));
  }

  handleException(error: any, errorMessageToBeDisplayed: string) {
    this.apiService.handleApiException(error);
    this.toastService.error(errorMessageToBeDisplayed);
  }

  ngOnDestroy() {
    this.observableSubscriptions.unsubscribe();
  }
}
