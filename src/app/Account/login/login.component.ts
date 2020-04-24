import { Component, OnInit, Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from 'src/app/services/tenant.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isSAMLAuth = false;
  isADFSAuth = false;
  passwordTextboxType = 'password';
  passwordToggleClass = 'icon icon-eye';
  tenantLogoUrl = '';
  tenantName = '';
  adfsLoginUrl = '#';
  samlLoginUrl = '#';
  authData = '';
  submitted = false;
  failedLoginMessage = '';
  isLoginInProgress = false;
  returnUrl: string;
  constructor(private apiService: ApiService, private authService: AuthService, private route: Router,
              private tenantService: TenantService, private formBuilder: FormBuilder, 
              private titleService: Title, private router: ActivatedRoute) {
  }

  ngOnInit() {
    if (localStorage.getItem('AccessToken') !== null) {
      this.route.navigate(['/dashboard']);
    }
    this.tenantService.getTenantInfo().subscribe(
      (response) => { this.setTenantInfo(response); },
      (error) => { this.handleGetTenantInfoError(error); }
    );
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.router.snapshot.queryParams['returnUrl'] || '/';
  }

  formControl() {
    return this.form.controls;
  }

  setTenantInfo(data: any) {
    this.isADFSAuth = data.Tenant.IsADFSAuthentication;
    this.isSAMLAuth = data.Tenant.IsSAMLAuthentication;
    this.tenantLogoUrl = data.Tenant.TenantLogo;
    this.tenantName = data.Tenant.TenantName;
    localStorage.setItem('tenantName', data.Tenant.TenantName);
    localStorage.setItem('tenantLogo', data.Tenant.TenantLogo);
    localStorage.setItem('tenantOrganization', data.Tenant.Organization);
    this.titleService.setTitle(this.tenantName + ' Login');
  }

  handleGetTenantInfoError(error: HttpErrorResponse) {
    this.tenantLogoUrl = '#';
    this.tenantName = 'Socxo Tenant Logo';
    this.apiService.handleApiException(error);
  }

  login() {    
    this.submitted = true;
    if (this.form.valid) {
      this.isLoginInProgress = true;
      this.authService.login(this.form.value.email, this.form.value.password).subscribe(
        (response) => { this.setUserDetailsOnloginSuccess(response); },
        (error) => { this.handleUserLoginError(error); });
    }
  }

  setUserDetailsOnloginSuccess(data: any) {
    this.authService.setUserDetailsToLocalStorage(data);
    this.route.navigateByUrl(this.returnUrl);
  }

  handleUserLoginError(error: HttpErrorResponse) {
    this.isLoginInProgress = false;
    this.failedLoginMessage = error.error !== null && error.error.error_description !== undefined ?
      error.error.error_description : 'Unknown error occurred!';
    this.apiService.handleApiException(error);
  }

  togglePassword() {
    // Toggles the class of the html element and the input element types to show and hide password.
    this.passwordTextboxType = this.passwordTextboxType === 'text' ? 'password' : 'text';
    this.passwordToggleClass = this.passwordToggleClass === 'icon icon-eye' ? 'icon icon-eye-off' : 'icon icon-eye';
  }
}
