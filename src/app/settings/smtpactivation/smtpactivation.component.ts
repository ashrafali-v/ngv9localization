import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-smtpactivation',
  templateUrl: './smtpactivation.component.html'
})
export class SmtpactivationComponent implements OnInit {
  activationToken: string;
  isActivationInProgress: boolean;
  smtpActivationSuccessful: boolean;
  smtpActivationFailed: boolean;
  smtpActivationFailureMessage: string;

  constructor(private route: ActivatedRoute, private settingsService: SettingsService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(
      params => {
        this.activationToken = params.Token;
      }
    )

    if (this.activationToken != '' && this.activationToken != null) {
      this.ActivateSMTPConfigurations();
    }
  }

  ActivateSMTPConfigurations() {
    this.isActivationInProgress = true;
    this.settingsService.activateSMTPConfigurations(this.activationToken).subscribe(
      (success) => {
        this.isActivationInProgress = false;
        this.smtpActivationSuccessful = true;
      },
      (error) => {
        this.smtpActivationFailureMessage = "SMTP activation failed!"
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.smtpActivationFailureMessage = error.error.ExceptionMessage
        }
        this.isActivationInProgress = false;
        this.smtpActivationFailed = true;
      }
    )
  }
}
