import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../dashboard.service'
import { DaterangepickerService } from 'src/app/services/daterangepicker.service';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from 'src/app/services/helper.service';
import { SubSink } from 'subsink';
declare var $: any;

@Component({
  selector: 'app-googleanalytics',
  templateUrl: './googleanalytics.component.html',
  styleUrls: []
})
export class GoogleanalyticsComponent implements OnInit, OnDestroy {
  dateRangeService: DaterangepickerService;
  tenantOrganization: string;
  lineChart: Chart;
  startDate = moment().subtract(14, 'days').format('DD MMM YYYY');
  endDate = moment().format('DD MMM YYYY');
  fullScreenToggleClass = "normalScreen";
  title = "GOOGLE ANALYTICS";
  googleAnalyticsProfiles: Observable<Array<Select2OptionData>>;
  selectedProfile = "0:0";
  selectedProfileName = "";
  metrics: Observable<Array<Select2OptionData>>;
  goals: Observable<Array<Select2OptionData>>;
  selectedMetric = "PageViews";
  selectedGoal = "1";
  errorOccurred = false;
  googleAnalyticsConnected = true;
  expandedView = false;
  isGraphRefreshing = false;
  isGraphLoadedInitially = false;
  totalContributedContent: string;
  totalContributedUsers: string;
  generatedPageViews: string;
  detailedTrafficList: any[];
  isGoalsSelected = false;
  isDetailedTrafficLoadingInProgress: boolean;
  totalPageViews = 0;
  totalFbPageViews = 0;
  totalTwitterPageViews = 0;
  totalLinkedinPageViews = 0;


  facebookPercent = "50";
  facebookSubtitle = "50";
  facebookSubtitleColor = "#61ab86";
  facebookOuterStrokeColor = "#6dd19f";
  facebookInnerStrokeColor = "#d4e8de";
  facebookTrendDiff = 0;
  facebookIsTrending = true;
  facebookIsTrendingStright = false;

  twitterPercent = "50";
  twitterSubtitle = "50";
  twitterSubtitleColor = "#61ab86";
  twitterOuterStrokeColor = "#6dd19f";
  twitterInnerStrokeColor = "#d4e8de";
  twitterTrendDiff = 0;
  twitterIsTrending = true;
  twitterIsTrendingStright = false;

  linkedInPercent = "50";
  linkedInSubtitle = "50";
  linkedInSubtitleColor = "#61ab86";
  linkedInOuterStrokeColor = "#6dd19f";
  linkedInInnerStrokeColor = "#d4e8de";
  linkedInTrendDiff = 0;
  linkedInIsTrending = true;
  linkedInIsTrendingStright = false;
  private subs = new SubSink();

  constructor(private dashboardService: DashboardService, private apiService: ApiService,
    private modalService: NgbModal, private helperService: HelperService) {
    this.dateRangeService = new DaterangepickerService('#gadaterange', false);
    this.tenantOrganization = localStorage.getItem('tenantOrganization') != null ? localStorage.getItem('tenantOrganization') : '';
  }

  ngOnInit() {
    var self = this;
    $('#gadaterange').on('apply.daterangepicker', function (ev, picker) {
      self.startDate = picker.startDate.format('DD MMM YYYY');
      self.endDate = picker.endDate.format('DD MMM YYYY');
      if (self.isGoalsSelected) {
        self.getGranularGoogleGoalAnalytics();
      }
      else {
        self.getGranularGoogleAnalytics();
      }
    });
  }

  initializeGoogleAnalytics() {
    if (!this.expandedView) {
      this.getGoogleAnalyticsProfiles();
      this.getGoogleAnalyticsMetrics();
      this.getGranularGoogleAnalytics();
      this.isGraphLoadedInitially = true;
    }

    this.expandedView = !this.expandedView;
  }

  refresh() {
    if (this.isGoalsSelected) {
      this.getGoogleAnalyticsGoals();
      this.getGranularGoogleGoalAnalytics();
    }
    else {
      this.getGoogleAnalyticsMetrics();
      this.getGranularGoogleAnalytics();
    }
  }

  getGranularGoogleAnalytics() {
    if (this.googleAnalyticsConnected && !this.isGraphRefreshing) {
      this.isGraphRefreshing = true;
      this.subs.sink = this.dashboardService.getGranularGoogleAnalytics(this.startDate, this.endDate, this.selectedProfile.split(':')[1], this.selectedProfile.split(':')[0], this.selectedMetric).subscribe(
        (success) => {
          this.populateGoogleAnalyticsGraph(success);
          this.setTrendAnalysis(success);

        },
        (error) => { this.showError(error); }
      );
      this.getGoogleAnalyticsTraffic();
    }
  }

  getGranularGoogleGoalAnalytics() {
    if (this.googleAnalyticsConnected && !this.isGraphRefreshing) {
      this.isGraphRefreshing = true;
      this.subs.sink = this.dashboardService.getGranularGoogleGoalAnalytics(this.startDate, this.endDate, this.selectedProfile.split(':')[1], this.selectedProfile.split(':')[0], this.selectedGoal).subscribe(
        (success) => {
          this.populateGoogleAnalyticsGraph(success);
          this.setTrendAnalysis(success);
        },
        (error) => { this.showError(error); }
      );
    }
  }

  getGoogleAnalyticsTraffic() {
    this.subs.sink = this.dashboardService.getGoogleAnalyticsTraffic(this.startDate, this.endDate, this.selectedProfile.split(':')[1], this.selectedProfile.split(':')[0], this.selectedMetric).subscribe(
      (success) => { this.populateGoogleAnalyticsTraffic(success); },
      (error) => { this.showError(error); }
    )
  }

  getGoogleAnalyticsProfiles() {
    this.subs.sink = this.dashboardService.getGoogleAnalyticsProfiles().subscribe(
      (success) => { this.populateGoogleAnalyticsProfilesDropdown(success); },
      (error) => { this.showError(error); }
    )
  }

  getGoogleAnalyticsMetrics() {
    this.subs.sink = this.dashboardService.getGoogleAnalyticsMetrics().subscribe(
      (success) => { this.populateGoogleAnalyticsMetricsDropdown(success); },
      (error) => { this.showError(error); }
    )
  }

  getGoogleAnalyticsGoals() {
    if (this.googleAnalyticsConnected) {
      this.subs.sink = this.dashboardService.getGoogleAnalyticsGoals(this.selectedProfile.split(':')[1], this.selectedProfile.split(':')[0], localStorage.getItem('Username')).subscribe(
        (success) => { this.populateGoogleAnalyticsGoalsDropdown(success); },
        (error) => { this.showError(error); }
      )
    }
  }

  getDetailedGoogleAnalyticsTraffic(detailedTraffic) {
    let profileNames: any;
    profileNames = this.googleAnalyticsProfiles;
    this.selectedProfileName = profileNames.find(c => c.id == this.selectedProfile).text;
    this.isDetailedTrafficLoadingInProgress = true;
    this.subs.sink = this.dashboardService.getGoogleAnalyticsTrafficInDetail(this.startDate, this.endDate, this.selectedProfile.split(':')[1], this.selectedProfile.split(':')[0], this.selectedMetric).subscribe(
      (success: any) => { this.populateGoogleAnalyticsDetailedTrafficArray(success.DetailedTrafficAnalytics.Blurbs, detailedTraffic); },
      (error) => { this.showError(error); }
    )
  }

  populateGoogleAnalyticsDetailedTrafficArray(data: any, detailedTraffic) {
    this.detailedTrafficList = data;
    this.isDetailedTrafficLoadingInProgress = false;
    this.modalService.open(detailedTraffic, { ariaLabelledBy: 'modal-basic-title', size: 'xl', scrollable: true });
  }

  populateGoogleAnalyticsProfilesDropdown(data: any) {
    if (data.GoogleAnalyticsProfiles) {
      this.googleAnalyticsProfiles = this.helperService.createDropdownObservable(data.GoogleAnalyticsProfiles, "0:0", "All");
    }
    else {
      this.googleAnalyticsConnected = false;
    }
  }

  populateGoogleAnalyticsMetricsDropdown(data: any) {
    this.metrics = this.helperService.createDropdownObservable(data.Metrics);
  }

  populateGoogleAnalyticsGoalsDropdown(data: any) {
    this.goals = this.helperService.createDropdownObservable(data.GoogleAnalyticsGoals);
  }

  populateGoogleAnalyticsTraffic(data: any) {
    this.totalContributedContent = data.TotalContributedContents;
    this.totalContributedUsers = data.TotalContributedUsers;
    this.generatedPageViews = data.GeneratedPageViews;
  }

  setTrendAnalysis(response: any) {
    if (response.TrendAnalysis.FacebookTrend != null) {
      let trendFacebook = response.TrendAnalysis.FacebookTrend;
      this.facebookPercent = trendFacebook.Percentage;
      this.facebookSubtitle = this.helperService.nFormatter(trendFacebook.Percentage) + "%";
      this.facebookIsTrending = trendFacebook.IsTrendingUp || trendFacebook.IsTrendingStright;
      this.facebookIsTrendingStright = trendFacebook.IsTrendingStright;
      this.facebookSubtitleColor = this.facebookIsTrending ? "#61ab86" : "#e24e72";
      this.facebookOuterStrokeColor = this.facebookIsTrending ? "#6dd19f" : "#F8426E";
      this.facebookInnerStrokeColor = this.facebookIsTrending ? "#d4e8de" : "#efd8dc";
      this.facebookTrendDiff = this.helperService.nFormatter(this.facebookIsTrending ? trendFacebook.Difference : -trendFacebook.Difference);
    }

    if (response.TrendAnalysis.TwitterTrend != null) {
      let trendTwitter = response.TrendAnalysis.TwitterTrend;
      this.twitterPercent = trendTwitter.Percentage;
      this.twitterSubtitle = this.helperService.nFormatter(trendTwitter.Percentage) + "%";
      this.twitterIsTrending = trendTwitter.IsTrendingUp || trendTwitter.IsTrendingStright;
      this.twitterIsTrendingStright = trendTwitter.IsTrendingStright;
      this.twitterSubtitleColor = this.twitterIsTrending ? "#61ab86" : "#e24e72";
      this.twitterOuterStrokeColor = this.twitterIsTrending ? "#6dd19f" : "#F8426E";
      this.twitterInnerStrokeColor = this.twitterIsTrending ? "#d4e8de" : "#efd8dc";
      this.twitterTrendDiff = this.helperService.nFormatter(this.twitterIsTrending ? trendTwitter.Difference : -trendTwitter.Difference);
    }

    if (response.TrendAnalysis.LinkedInTrend != null) {
      let trendLinkedIn = response.TrendAnalysis.LinkedInTrend;
      this.linkedInPercent = trendLinkedIn.Percentage;
      this.linkedInSubtitle = this.helperService.nFormatter(trendLinkedIn.Percentage) + "%";
      this.linkedInIsTrending = trendLinkedIn.IsTrendingUp || trendLinkedIn.IsTrendingStright;
      this.linkedInIsTrendingStright = trendLinkedIn.IsTrendingStright;
      this.linkedInSubtitleColor = this.linkedInIsTrending ? "#61ab86" : "#e24e72";
      this.linkedInOuterStrokeColor = this.linkedInIsTrending ? "#6dd19f" : "#F8426E";
      this.linkedInInnerStrokeColor = this.linkedInIsTrending ? "#d4e8de" : "#efd8dc";
      this.linkedInTrendDiff = this.helperService.nFormatter(this.linkedInIsTrending ? trendLinkedIn.Difference : -trendLinkedIn.Difference);
    }
  }

  showError(error: HttpErrorResponse) {
    this.errorOccurred = true;
    this.isGraphRefreshing = false;
    this.apiService.handleApiException(error);
  }

  populateGoogleAnalyticsGraph(data) {
    let chartLables = [];
    let dataSets = [];
    this.totalPageViews = 0;
    this.totalFbPageViews = 0;
    this.totalTwitterPageViews = 0;
    this.totalLinkedinPageViews = 0;
    data.GranularGoogleAnalytics.forEach((element, index) => {
      let analyticData = [];
      element.m_Item2.forEach(analytic => {
        chartLables.push(analytic.m_Item1);
        analyticData.push(analytic.m_Item2);
        this.totalPageViews += +analytic.m_Item2;
        if (element.m_Item1 == "Facebook") {
          this.totalFbPageViews += +analytic.m_Item2;
        } else if (element.m_Item1 == "Twitter") {
          this.totalTwitterPageViews += +analytic.m_Item2;
        } else {
          this.totalLinkedinPageViews += +analytic.m_Item2;
        }
      })
      let dataSet = {
        label: element.m_Item1,
        data: analyticData,
        fill: true,
        lineTension: 0.2,
        borderColor: this.dashboardService.colorSets[index],
        backgroundColor: this.dashboardService.backgroundSets[index],
        borderWidth: 2,
      }
      dataSets.push(dataSet);
    });

    this.isGraphRefreshing = false;
    this.fillChart(chartLables, dataSets);
  }

  fillChart(labels: any, dataSets: any) {
    if (this.lineChart != undefined) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart('googleAnalyticsLineChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: dataSets
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
  }

  toggleFullscreenView() {
    this.fullScreenToggleClass = this.fullScreenToggleClass === 'normalScreen' ? 'fullScreen' : 'normalScreen';
  }

  radioButtonChange(event) {
    if (event.target.value === 'goal') {
      this.title = "CONVERSION ANALYTICS";
      this.selectedProfile = this.googleAnalyticsProfiles != null && this.googleAnalyticsProfiles != undefined ? this.googleAnalyticsProfiles[1].id : '';
      this.isGoalsSelected = true;
      this.getGoogleAnalyticsGoals();
      this.getGranularGoogleGoalAnalytics();
    }
    else {
      this.isGoalsSelected = false;
      this.title = "GOOGLE ANALYTICS";
      this.getGranularGoogleAnalytics();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
