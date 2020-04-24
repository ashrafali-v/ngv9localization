import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  accountApiEndPoints = {
    resetPassword: 'account/forgotpassword'
  }

  constructor(private apiService: ApiService) { }

  forgotPassword(email: string) {
    const postBody = JSON.stringify({ Email: email });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.postData(this.accountApiEndPoints['resetPassword'], postBody, headers, 0);
  }
}
