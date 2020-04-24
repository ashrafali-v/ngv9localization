import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from 'src/app/services/toast.service';
import { SMTPConfigurations } from '../models/SMTPConfigurations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from 'src/app/services/helper.service';
import { Select2OptionData } from 'ng-select2';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent implements OnInit, OnDestroy {

  // smtp variables
  form: FormGroup;
  errorOccurred = false;
  enableAddingSMTPConfigOption = false;
  smtpConfigSetButNotActivated: boolean;
  enableRestoreDefaults: boolean;
  smtpConfigUpdateInProgress: boolean;
  isResendActivationMailInProgress: boolean;
  isResetSMTPConfigInProgress: boolean;
  SMTPConfigSubmitted = false;
  showSMTPEditButton = false;
  isSmtpConfigLoadingInProgress = true;
  initialSMTPLoadSuccess = true;

  // saml variables
  SAMLAuthStatus: any;
  SAMLIdpURL: string;
  SAMLCertificate: string;
  samlAuthUpadated = false;
  initialSAMLLoadSuccess = true;

  // password config variables
  isPasswordExpiry: any;
  expiryDurationCount = ['15', '30', '45', '60', '90', '120'];
  selectedExpiryDuration = "5";
  expiryDuration: Observable<Array<Select2OptionData>>;
  isShowExpiryDays: any;
  selectedDuration: any;
  passwordType = "5";
  passwordStrengthPercent: any;
  passwordStrengthType: any;
  isPasswordComplexityEnabled: any;
  enableConfirm = false;
  defaultPasswordType: any;
  initialPasswordConfigSuccess = true;

  //common variables
  private subs = new SubSink();

  constructor(private settingsService: SettingsService, private apiService: ApiService,
    private formBuilder: FormBuilder, private toastService: ToastService,
    private modalService: NgbModal, private helper: HelperService) { }

  ngOnInit() {
    this.buildForm();
    this.form.disable();
    this.getSMTPConfigurations(true);
    this.getSAMLAuthSettings();
    this.getPasswordSettings();
    this.expiryDuration = this.helper.createDropdownObservable(this.expiryDurationCount);
  }

  buildForm() {
    this.form = this.formBuilder.group({
      smtpHost: ['', [Validators.required, Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9.]+$')]],
      smtpUsername: ['', [Validators.required, Validators.maxLength(80)]],
      smtpPassword: ['', [Validators.required, Validators.maxLength(80)]],
      smtpPort: ['', [Validators.required, Validators.pattern('^\s*-?[0-9]{1,10}\s*$')]],
      smtpEmailAddress: ['', [Validators.required, Validators.maxLength(80), Validators.email]],
      isSmtpSSLEnabled: [false]
    });
  }

  getSMTPConfigurations(isInitialLoad: boolean) {
    this.subs.sink = this.settingsService.getSMTPConfigurations().subscribe(
      (success) => { this.fillSMTPConfig(success); this.isSmtpConfigLoadingInProgress = false;},
      (error) => { 
        if (isInitialLoad) {
          this.initialSMTPLoadSuccess = false;
        } else {
          this.showError(error, 'Failed to fetch smtp configurations.');
        }   
      }
    );
  }

  fillSMTPConfig(data: any) {
    if (data.Host != null && data.Username != null && data.Password != null && data.Port != null) {
      this.enableAddingSMTPConfigOption = false;
      this.showSMTPEditButton = true;
      this.form.patchValue({
        smtpHost: data.Host,
        smtpUsername: data.Username,
        smtpPassword: data.Password,
        smtpPort: data.Port,
        smtpEmailAddress: data.FromEmailAddress,
        isSmtpSSLEnabled: data.IsSSLEnabled
      });

      this.enableRestoreDefaults = true;
    } else {
      if (data.IsSMTPConfigSet) {
        // This is the case when smtp config is set already, but not activated yet by clicking the activation link.
        // A message will be displayed accordingly and also resend mail button will be active.
        this.smtpConfigSetButNotActivated = true;
      }
      else {
        // This is the case when no smtp config is set and there will be a button enabled to add config.
        this.enableAddingSMTPConfigOption = true;
      }
    }
  }

  enableAddingSMTPConfig() {
    // Form controls will be visible and enabled to add or edit smtp config.
    this.SMTPConfigSubmitted = false;
    this.enableRestoreDefaults = false;
    this.enableAddingSMTPConfigOption = false;
    this.form.enable();
  }

  cancelAddingSMTPConfig() {
    // Cancels the add/edit config operation and calls the initial loading process.
    var r = confirm("Unsaved changes will be discarded, do you wish to continue?");
    if (r == true) {
      this.form.disable();
      this.getSMTPConfigurations(false);
    }     
  }

  updateSMTPConfigurations() {
    this.SMTPConfigSubmitted = true;
    if (this.form.valid) {
      this.smtpConfigUpdateInProgress = true;
      let smtpConfig = new SMTPConfigurations();
      smtpConfig.Username = this.form.value.smtpUsername;
      smtpConfig.Password = this.form.value.smtpPassword;
      smtpConfig.Host = this.form.value.smtpHost;
      smtpConfig.Port = this.form.value.smtpPort;
      smtpConfig.FromEmailAddress = this.form.value.smtpEmailAddress;
      smtpConfig.IsSSLEnabled = this.form.value.isSmtpSSLEnabled;
      this.subs.sink = this.settingsService.updateSMTPConfigurations(smtpConfig, localStorage.getItem("Username"), false).subscribe(
        (success) => {
          this.smtpConfigUpdateInProgress = false;
          this.enableAddingSMTPConfigOption = false;
          this.smtpConfigSetButNotActivated = true;
          this.toastService.success('SMTP configurations have been updated.');
        },
        (error) => {
          this.smtpConfigUpdateInProgress = false;
          this.showError(error, 'Failed to update smtp configurations.');
        }
      )
    }
  }

  resendActivationEmail() {
    this.isResendActivationMailInProgress = true;
    let smtpConfig = new SMTPConfigurations();
    this.subs.sink = this.settingsService.updateSMTPConfigurations(smtpConfig, localStorage.getItem("Username"), true).subscribe(
      (success) => {
        this.isResendActivationMailInProgress = false;
        this.enableAddingSMTPConfigOption = false;
        this.toastService.success('Activation email has been resent.');
      },
      (error) => {
        this.isResendActivationMailInProgress = false;
        this.showError(error, 'Failed to send the e-mail to activate smtp configurations.');
      }
    )
  }

  formControl() {
    return this.form.controls;
  }

  resetSMTPConfig() {
    this.isResetSMTPConfigInProgress = true;
    this.subs.sink = this.settingsService.resetSMTPConfigurations().subscribe(
      (success) => {
        this.isResetSMTPConfigInProgress = false;
        this.enableAddingSMTPConfigOption = true;
        this.smtpConfigSetButNotActivated = false;
        this.toastService.success('SMTP configurations have been reset to default.');
      },
      (error) => {
        this.isResetSMTPConfigInProgress = false;
        this.showError(error, 'Failed to reset smtp configurations.');
      }
    )
  }

  showError(error: HttpErrorResponse, errorMessageToBeDisplayed: string) {
    this.apiService.handleApiException(error);
    this.toastService.error(errorMessageToBeDisplayed);
  }

  getSAMLAuthSettings() {
    this.subs.sink = this.settingsService.getSAMLAuthenticationSettings().subscribe(
      (success) => {
        this.setSamlAuthData(success);
      },
      (error) => { 
        this.initialSAMLLoadSuccess = false;
      }
    );
  }

  setSamlAuthData(response) {
    this.SAMLAuthStatus = response.SAMLAuthData.SAMLAuthEnabled == "True" ? true : false;
    this.SAMLIdpURL = response.SAMLAuthData.SAMLIdpURL;
    this.SAMLCertificate = response.SAMLAuthData.SAMLCertificate;
  }

  enableSAML() {
    let samlSettings = [
      { "Name": "SAMLAuthEnabled", "Value": this.SAMLAuthStatus },
      { "Name": "SAMLIdpURL", "Value": this.SAMLIdpURL },
      { "Name": "SAMLCertificate", "Value": this.SAMLCertificate }]
      this.subs.sink = this.settingsService.setSAMLAuthenticationSettings(samlSettings, localStorage.getItem("Username")).subscribe(
      (success) => {
        this.samlAuthUpadated = true;
        setTimeout(() => {
          this.samlAuthUpadated = false;
        }, 5000);
      },
      (error) => {
        this.showError(error, 'Failed to enable SAML authentication.');
      });
  }

  getPasswordSettings() {
    this.subs.sink = this.settingsService.getPasswordSettings().subscribe(
      (success) => {
        this.setPasswordSettings(success);
      },
      (error) => { 
        this.initialPasswordConfigSuccess = false;
      }
    );
  }

  setPasswordSettings(response) {
    let expirySettings: any;
    let currentExpiryDuration: any;
    let passwordComplexity: any;
    let isPasswordComplexity: any;
    this.isPasswordExpiry = response.PasswordExpiryAndComplexity.forEach(element => {
      if (element.Name == 'IsPasswordExpiryEnabled') {
        expirySettings = element;
      }
      if (element.Name == 'PasswordExpiryDays') {
        currentExpiryDuration = element;
      }
      if (element.Name == 'PasswordComplexity') {
        passwordComplexity = element;
      }
      if (element.Name == 'IsPasswordComplexityEnabled') {
        isPasswordComplexity = element;
      }
    });
    if (expirySettings.Value != "false") {
      this.expiryDuration.forEach(element => {
        if (element["text"] == currentExpiryDuration.Value) {
          this.selectedExpiryDuration = element["id"];
        }
      });
    }

    this.isPasswordExpiry = expirySettings.Value == "false" ? false : true;
    this.passwordType = passwordComplexity.Value;
    this.isPasswordComplexityEnabled = isPasswordComplexity.Value;
    this.defaultPasswordType = this.passwordType;

    if (this.passwordType == "1") {
      this.passwordStrengthPercent = 100;
      this.passwordStrengthType = "Super Strong";
    }
    else if (this.passwordType == "2") {
      this.passwordStrengthPercent = 75;
      this.passwordStrengthType = "Strong";
    }
    else if (this.passwordType == "3") {
      this.passwordStrengthPercent = 50;
      this.passwordStrengthType = "Good";
    }
    else if (this.passwordType == "4") {
      this.passwordStrengthPercent = 25;
      this.passwordStrengthType = "Fair";
    }
    else if (this.passwordType == "5") {
      this.passwordStrengthPercent = 10;
      this.passwordStrengthType = "Low";
    }
    this.popupExpiryDuration();
  }

  popupExpiryDuration() {
    this.expiryDuration = this.helper.createDropdownObservable(this.expiryDurationCount);
  }

  changeExpiryDuration() {
    this.selectedDuration = this.expiryDurationCount[this.selectedExpiryDuration];
  }

  setPasswordExpiry() {
    let pwdExp = this.isPasswordExpiry;
    let contentSettingValue = this.expiryDurationCount[this.selectedExpiryDuration];
    let passwordExpirySettings = [
      { "Name": "PasswordExpiryDays", "Value": this.expiryDurationCount[this.selectedExpiryDuration] },
      { "Name": "IsPasswordExpiryEnabled", "Value": this.isPasswordExpiry }]

      this.subs.sink = this.settingsService.setPasswordExpiry(passwordExpirySettings, localStorage.getItem("Username")).subscribe(
      (success) => {
        setTimeout(() => {
          this.toastService.success('Password expiry has been updated.');
        }, 5000);
      },
      (error) => {
        this.showError(error, 'Failed to update password expiry.');
      });
  }

  changePasswordStrength() {
    this.enableConfirm = true;
  }

  setPasswordComplexity() {
    let passwordComplexitySettings = [
      { "Name": "PasswordComplexity", "Value": this.passwordType },
      { "Name": "IsPasswordComplexityEnabled", "Value": this.isPasswordComplexityEnabled }]

      this.subs.sink = this.settingsService.setPasswordComplexity(passwordComplexitySettings, localStorage.getItem("Username")).subscribe(
      (success) => {
        setTimeout(() => {
          this.toastService.success('Password complexity has been updated.');
        }, 5000);
      },
      (error) => {
        this.showError(error, 'Failed to update password complexity.');
      });
  }

  closePasswordExpiry() {
    this.isPasswordExpiry = false;
  }

  closePasswordComplexity() {
    this.passwordType = this.defaultPasswordType;
    this.enableConfirm = false;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
