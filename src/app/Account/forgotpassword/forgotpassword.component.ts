import { Component, OnInit } from '@angular/core';
import { TenantService } from 'src/app/services/tenant.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html'
})
export class ForgotpasswordComponent implements OnInit {
  form: FormGroup;
  tenantLogoUrl = '';
  tenantName = '';
  passwordResetSuccess = false;
  passwordResetFailureMessage = '';
  submitted = false;
  constructor(private tenantService: TenantService, private apiService: ApiService,
              private formBuilder: FormBuilder, private accountService: AccountService, private route: Router,
              private titleService: Title) { }

  ngOnInit() {
    if (localStorage.getItem('AccessToken') !== null) {
      this.route.navigate(['/dashboard']);
    }
    this.tenantService.getTenantInfo().subscribe(
      (response) => { this.setTenantInfo(response); },
      (error) => { this.handleGetTenantInfoError(error); }
    );
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  setTenantInfo(data: any) {
    this.tenantLogoUrl = data.Tenant.TenantLogo;
    this.tenantName = data.Tenant.TenantName;
    this.titleService.setTitle(this.tenantName + ' Forgot Password');
  }

  formControl() {
    return this.form.controls;
  }

  handleGetTenantInfoError(error: HttpErrorResponse) {
    this.tenantLogoUrl = '#';
    this.tenantName = 'Socxo Tenant Logo';
    this.apiService.handleApiException(error);
  }

  forgotPassword() {
    this.submitted = true;
    if (this.form.valid) {
      this.accountService.forgotPassword(this.form.value.email).subscribe(
        (response) => { this.forgotPasswordSuccessCallback(response); },
        (error) => { this.handleforgotPasswordError(error); });
    }
  }

  forgotPasswordSuccessCallback(data: any) {
    this.passwordResetSuccess = true;
  }

  handleforgotPasswordError(error: HttpErrorResponse) {
    this.passwordResetFailureMessage = error.error !== null && error.error.Message !== undefined ?
     error.error.Message : 'Unknown error occurred!';
    this.apiService.handleApiException(error);
  }
}
