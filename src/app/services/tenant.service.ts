import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  tenantApiEndPoints = {
    tenantInfo: 'tenant/info',
    tenantCategoryList: 'tenant/teamcategorylist'
  }
  
  constructor(private apiService: ApiService) { }

  getTenantInfo() {
    const postBody = JSON.stringify({ DomainName: this.apiService.getHostName() });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.postData(this.tenantApiEndPoints['tenantInfo'], postBody, headers, 1);
  }

  getTeamCategoryList() {
    return this.apiService.getData(this.tenantApiEndPoints['tenantCategoryList'], 1);
  }
}
