import { DashboardService } from '../dashboard.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { DaterangepickerService } from 'src/app/services/daterangepicker.service';
import { TenantService } from 'src/app/services/tenant.service';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
import 'chartjs-plugin-zoom';
import { HelperService } from 'src/app/services/helper.service';
import { SubSink } from 'subsink';

declare var $: any;

@Component({
  selector: 'app-sharesandengagements',
  templateUrl: './sharesandengagements.component.html',
  styleUrls: []
})

export class SharesandengagementsComponent implements OnInit, OnDestroy {  
  lineChart: Chart;
  tenantOrganization: string;
  startDate = moment().subtract(14, 'days').format('DD MMM YYYY');
  endDate = moment().format('DD MMM YYYY');
  teamSelectEnabled = true;
  categorySelectEnabled = false;
  isGraphRefreshing = false;
  dateRangeService: DaterangepickerService;
  teamList: Observable<Array<Select2OptionData>>;
  categoryList: Observable<Array<Select2OptionData>>;
  providerList: Observable<Array<Select2OptionData>>;
  isDropdownsLoaded = false;
  isGraphLoaded = false;
  isTotalSharesAndEngagementsLoaded = true;
  selectedProviderId = "0";
  selectedTeamId = "0";
  selectedCategoryId = "0";
  errorOccurred = false;
  fullScreenToggleClass = "normalScreen";
  isTrending = true;
  isTrendingStright = false;
  sharePercent = "50";
  shareSubtitle = "50";
  shareSubtitleColor = "#61ab86";
  shareOuterStrokeColor = "#6dd19f";
  shareInnerStrokeColor = "#d4e8de";
  hasError = false;
  sharetrendTotal = 0;
  shareTrendDiff = 0;

  engagementPercent = "50";
  engagementSubtitle = "50";
  engagementSubtitleColor = "#61ab86";
  engagementOuterStrokeColor = "#6dd19f";
  engagementInnerStrokeColor = "#d4e8de";
  engagementTrendDiff = 0;
  engagementIsTrending = true;
  engagementIsTrendingStright = false;
  totalShare = 0;
  totalEngagement = 0;
  private subs = new SubSink();

  constructor(private tenantService: TenantService, private dashboardService: DashboardService,
    private apiService: ApiService, private helperService: HelperService) {
    this.tenantOrganization = localStorage.getItem('tenantOrganization') != null ? localStorage.getItem('tenantOrganization') : '';
    this.dateRangeService = new DaterangepickerService('#sedaterange', false);
  }

  ngOnInit() {
    var self = this;
    // Disable automatic style injection for strict csp when deployed to a server
    Chart.platform.disableCSSInjection = true;

    this.subs.sink = this.tenantService.getTeamCategoryList().subscribe(
      (success) => { this.populateDropdowns(success); },
      (error) => { this.showError(error) });

    $('#sedaterange').on('apply.daterangepicker', function (ev, picker) {
      self.startDate = picker.startDate.format('DD MMM YYYY');
      self.endDate = picker.endDate.format('DD MMM YYYY');
      self.getGranularSocialMediaAnalytics();
    });
  }

  getGranularSocialMediaAnalytics() {
    if (!this.isGraphRefreshing) {
      this.isGraphRefreshing = true;
      let providerId = this.selectedProviderId;
      let teamId = this.teamSelectEnabled ? this.selectedTeamId : null;
      let categoryId = this.categorySelectEnabled ? this.selectedCategoryId : null;
      this.subs.sink = this.dashboardService.getSharesAndEngagements(providerId, this.startDate, this.endDate, teamId, categoryId).subscribe(
        (success) => {
          this.setGranularSocialMediaAnalytics(success);
          this.setTrend(success)
        },
        (error) => { this.showError(error) });
    }
  }

  setGranularSocialMediaAnalytics(response: any) {
    let chartLables = [];
    let chartTotalEngagements = [];
    let chartTotalShares = [];
    response.SharesAndEngagements.forEach(element => {
      chartLables.push(element.m_Item1);
      chartTotalShares.push(element.m_Item2);
      chartTotalEngagements.push(element.m_Item3);
    });
    this.fillChart(chartLables, chartTotalShares, chartTotalEngagements);
    this.setTotalShareAndEngagements(chartTotalShares, chartTotalEngagements);
    this.isGraphRefreshing = false;
  }

  setTotalShareAndEngagements(totalShares: any[], totalEngagements: any[]) {
    this.totalShare = 0;
    this.totalEngagement = 0;
    totalShares.forEach(element => {
      this.totalShare += +element;
    });

    totalEngagements.forEach(element => {
      this.totalEngagement += +element;
    });
  }

  setTrend(response: any) {
    let trendShares = response.TrendAnalysis.Shares;
    this.sharePercent = trendShares.Percentage;
    this.shareSubtitle = this.helperService.nFormatter(trendShares.Percentage) + "%";
    this.isTrending = trendShares.IsTrendingUp;
    this.isTrendingStright = trendShares.IsTrendingStright;
    this.shareSubtitleColor = this.isTrending ? "#61ab86" : "#e24e72";
    this.shareOuterStrokeColor = this.isTrending ? "#6dd19f" : "#F8426E";
    this.shareInnerStrokeColor = this.isTrending ? "#d4e8de" : "#efd8dc";
    this.shareTrendDiff = this.helperService.nFormatter(this.isTrending ? trendShares.Difference : -trendShares.Difference);

    let trendEngagements = response.TrendAnalysis.Enagagements;
    this.engagementPercent = trendEngagements.Percentage;
    this.engagementSubtitle = this.helperService.nFormatter(trendEngagements.Percentage) + "%";
    this.engagementIsTrending = trendEngagements.IsTrendingUp;
    this.engagementIsTrendingStright = trendEngagements.IsTrendingStright;
    this.engagementSubtitleColor = this.engagementIsTrending ? "#61ab86" : "#e24e72";
    this.engagementOuterStrokeColor = this.engagementIsTrending ? "#6dd19f" : "#F8426E";
    this.engagementInnerStrokeColor = this.engagementIsTrending ? "#d4e8de" : "#efd8dc";
    this.engagementTrendDiff = this.helperService.nFormatter(this.engagementIsTrending ? trendEngagements.Difference : -trendEngagements.Difference);
  }

  showError(error: HttpErrorResponse) {
    this.errorOccurred = true;
    this.isGraphRefreshing = false;
    this.apiService.handleApiException(error);
  }

  populateDropdowns(data: any) {
    this.providerList = this.helperService.createDropdownObservable(data.AvailableProviderList, '0', 'All');
    this.teamList = this.helperService.createDropdownObservable(data.AvailableTeamList, '0', 'All');
    this.categoryList = this.helperService.createDropdownObservable(data.AvailableCategoryList, '0', 'All');
    this.isDropdownsLoaded = true;
  }

  fillChart(labels: any, totalShares: any, totalEngagements) {
    if (this.lineChart != undefined) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart('lineChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Shares',
          data: totalShares,
          fill: true,
          lineTension: 0.2,
          borderColor: '#ff9d76',
          borderWidth: 2,
          backgroundColor: 'rgba(255,157,118,0.4)'
        },
        {
          label: 'Engagements',
          data: totalEngagements,
          fill: true,
          lineTension: 0.2,
          borderColor: '#8bbabb',
          borderWidth: 2,
          backgroundColor: 'rgba(139,186,187,0.4)'
        }]
      },
      options: {
        title: {
          text: 'Line Chart',
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            }
          }],
          xAxes: [
            {
              type: 'time',
              time: {
                displayFormats: {
                  Day: 'MMM DD YY'
                },
                tooltipFormat: 'MMM DD YYYY'
              }
            }
          ]
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          enabled: true,
          mode: 'x',
        },
      },
    });
    this.isGraphLoaded = true;
  }

  toggleFullscreenView() {
    this.fullScreenToggleClass = this.fullScreenToggleClass === 'normalScreen' ? 'fullScreen' : 'normalScreen';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
