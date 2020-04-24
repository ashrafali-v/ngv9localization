import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  accountApiEndPoints = { login: 'oauth/login' }

  constructor(private apiService: ApiService, private route: Router, private encryptionService: EncryptionService) { }

  login(userName: string, password: string) {
    const encryptedPassword = this.encryptionService.encryptAES256(password);
    const postBody = 'grant_type=password&username=' + userName + '&password=' + encryptedPassword;
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.apiService.postData(this.accountApiEndPoints['login'], postBody, headers, 1);
  }

  logout(returnUrl?: string) {
    this.removeUserDetailsFromLocalStorage();
    this.route.navigate(['/login'], { queryParams: { returnUrl: returnUrl } });
  }

  refreshToken(): Observable<any> {
    const postBody = 'grant_type=refresh_token&refresh_token=' + localStorage.getItem('RefreshToken');
    return this.apiService.postData('login', postBody, null, 0);
  }

  setUserDetailsToLocalStorage(data: any) {
    localStorage.setItem('AccessToken', data.access_token);
    localStorage.setItem('RefreshToken', data.refresh_token);
    localStorage.setItem('Username', data.userName);
    localStorage.setItem('TokenExpiresIn', data.expires_in);
    localStorage.setItem('UserProfileImage', data.profileImage != '' && data.profileImage != null ? data.profileImage : 'assets/images/avatar-001.jpg');
    localStorage.setItem('UserRole', data.userRole);
  }

  removeUserDetailsFromLocalStorage() {
    localStorage.removeItem('AccessToken');
    localStorage.removeItem('RefreshToken');
    localStorage.removeItem('Username');
    localStorage.removeItem('TokenExpiresIn');
    localStorage.removeItem('UserProfileImage');
    localStorage.removeItem('UserRole');
  }
}
