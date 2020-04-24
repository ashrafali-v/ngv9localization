import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../dashboard/dashboard.service';
import { ApiService } from '../services/api.service';
import { HelperService } from '../services/helper.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit {
  tenantOrganization: string;
  dashboardTotal: any;
  errorOccurred = false;
  potentialReach: string;
  totalUsers: string;
  totalEmvGenerated: string;
  totalApprovedContent: string;

  constructor(private titleService: Title, private dashboardService: DashboardService,
    private apiService: ApiService,private helperService:HelperService) {
    this.tenantOrganization = localStorage.getItem('tenantOrganization') != null ? localStorage.getItem('tenantOrganization') : '';
    this.titleService.setTitle(this.tenantOrganization + ' Dashboard');
  }

  ngOnInit() {
    this.getDashboardTotals();
  }

  getDashboardTotals() {
    this.dashboardService.getDashboardTotals().subscribe(
      (success) => {
        this.setDashboardTotals(success);
      },
      (error) => {
        this.errorOccurred = true;
        this.apiService.handleApiException(error);
      })
  }

  setDashboardTotals(dashboardTotals) {
    this.potentialReach = this.helperService.nFormatter(dashboardTotals.DashboardTotals.PotentialReach);
    this.totalUsers = this.helperService.nFormatter(dashboardTotals.DashboardTotals.TotalUsers);
    this.totalEmvGenerated = this.helperService.nFormatter(dashboardTotals.DashboardTotals.TotalMediaValue);
    this.totalApprovedContent = this.helperService.nFormatter(dashboardTotals.DashboardTotals.TotalApprovedBlurbs);
  }
}
