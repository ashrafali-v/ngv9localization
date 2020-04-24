import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { DashboardService } from '../dashboard.service';
import { DaterangepickerService } from 'src/app/services/daterangepicker.service';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;


@Component({
  selector: 'app-contentperformanceanalytics',
  templateUrl: './contentperformanceanalytics.component.html',
  styleUrls: []
})


export class ContentperformanceanalyticsComponent implements OnInit {
  contentChart: any;
  dateRangeService: DaterangepickerService;
  contentAnalytics: any;
  contentAnalyticsIsLoading = false;
  chosenMod = 'Click';
  startDate: any;
  endDate: any;
  isInitialLoad = true;
  totalPageView: any;
  hasError = false;
  pageViewTotalIsLoading = false;
  isGraphExpanded = false;
  fullScreenToggleClass = "normalScreen";
  contentViewMore: any;
  page = 1;
  pageSize = 10;
  isViewMoreLoading = false;
  userViewMore: any;
  blurbSearchText = '';
  blurbSearchableList = 'Blurb';
  serachableProperty = ['Title', 'Description'];
  userSearchText = '';
  userbSearchableList = '';
  userSerachableProperty = ['DisplayName'];
  UserAsc = false;
  ShareAsc = false;
  EngagementAsc = false;
  ClickAsc =  false;
  TrafficAsc = false;
  ConversionAsc = false;
  UserShareAsc = false;
  UserEngagementAsc = false;
  UserClickAsc =  false;
  UserTrafficAsc = false;
  UserConversionAsc = false;
  hasErrorContentPerformanceViewMore = false;
  hasErrorUserWiseContentPerformanceAnaltics = false;


  constructor(private dashboardService: DashboardService, private apiService: ApiService, private modalService: NgbModal) {
    this.dateRangeService = new DaterangepickerService('#cpadaterange', false);
  }

  ngOnInit() {
    const self = this;

    $('#cpadaterange').on('apply.daterangepicker', function (ev, picker) {
      self.startDate = picker.startDate.format('DD MMM YYYY');
      self.endDate = picker.endDate.format('DD MMM YYYY');
      self.getContentPerformanceAnalytics(self.startDate, self.endDate);
      self.getPageviewTotals(self.startDate, self.endDate);
    });
  }

  initialLoadData() {
    this.isGraphExpanded = !this.isGraphExpanded;
    if (this.isGraphExpanded) {
      this.startDate = moment().subtract(14, 'days').format('DD MMM YYYY');
      this.endDate = moment().format('DD MMM YYYY');
      this.getContentPerformanceAnalytics(this.startDate, this.endDate);
      this.getPageviewTotals(this.startDate, this.endDate);
    }
  }

  getPageviewTotals(startDate: any, endDate: any) {
    this.pageViewTotalIsLoading = true;
    this.dashboardService.getPageviewTotals(startDate, endDate).subscribe(
      (response) => {
        this.pageViewTotalIsLoading = false;
        this.setTotalPageView(response);
      },
      (error) => { this.apiService.handleApiException(error); }
    )
  }

  getContentPerformanceAnalytics(startDate: any, endDate: any) {
    this.contentAnalyticsIsLoading = true;
    this.dashboardService.getContentPerformanceAnalytics(startDate, endDate, this.chosenMod).subscribe(
      (response) => {
        this.setContentPerformanceAnalytics(response);
        this.contentAnalyticsIsLoading = false;
        this.hasError = false;
        if (this.isInitialLoad) {
          this.loadChart();
          this.isInitialLoad = false;
        }
        else {
          const chartData = this.chartJsData(this.contentAnalytics);
          if (this.contentChart != null) {
            this.contentChart.data.datasets.forEach(function (dataset, datasetIndex) {
              dataset.data.shift();
            });
          }
          this.contentChart.data = chartData;
          this.contentChart.update();
        }
      },
      (error) => {
        this.hasError = true;
        this.contentAnalyticsIsLoading = false;
        this.apiService.handleApiException(error);
      }
    );
  }

  setContentPerformanceAnalytics(contentPerformanceAnalytics: any) {
    this.contentAnalytics = contentPerformanceAnalytics;

  }

  setTotalPageView(pageViews: any) {
    this.totalPageView = pageViews.ConsolidatedPageViews;
  }

  loadChart() {
    this.contentChart = new Chart('contentChart', {
      type: 'line',
      data: this.chartJsData(this.contentAnalytics),
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
                  Day: 'DD MMM YYYY'
                },
                tooltipFormat: 'DD MMM YYYY'
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
      }
    });
  }

  chartJsData(contentAnalyticsData: any) {
    let dataSets: { label: string, data: number, lineTension: number, fill: boolean, borderWidth: number, borderColor: string, backgroundColor: string }[] = [];
    contentAnalyticsData.ContentAnalytics.forEach((element, index) => {
      dataSets.push({
        'label': element.Provider,
        'data': element.DetailedContentAnalytics.map(function (c) {
          return c.Count
        }),
        'lineTension': 0.2,
        'fill': true,
        'borderWidth': 2,
        'borderColor': this.dashboardService.colorSets[index],
        'backgroundColor': this.dashboardService.backgroundSets[index]
      });
    });
    return {
      datasets: dataSets,
      labels: contentAnalyticsData.DateRange
    };
  }

  changeAnalyticsType() {
    this.getContentPerformanceAnalytics(this.startDate, this.endDate);
    this.getPageviewTotals(this.startDate, this.endDate);
  }

  toggleFullscreenView() {
    this.fullScreenToggleClass = this.fullScreenToggleClass === 'normalScreen' ? 'fullScreen' : 'normalScreen';
  }

  viewMore(content) {
    this.isViewMoreLoading = true;
    this.hasErrorContentPerformanceViewMore = false;
    this.dashboardService.getContentViewMore(this.startDate, this.endDate).subscribe(
      (response) => {
        this.setViewMore(response, content);
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.isViewMoreLoading = false;
        this.hasErrorContentPerformanceViewMore = true;
      }
    )
  }

  setViewMore(viewMore: any, content: any) {
    this.contentViewMore = viewMore.PageViewModel;
    for (var i = 0; i < this.contentViewMore.length; i++) {
      this.contentViewMore[i].isCollapsed = true; // add collapse to each element   
    }
    this.isViewMoreLoading = false;
    this.modalService.open(content, { size: 'xl', scrollable: true });
  }

  viewUserDetails(data) {
    this.hasErrorUserWiseContentPerformanceAnaltics =  false;
    this.dashboardService.getUserDetails(this.startDate, this.endDate, data.BlurbId).subscribe(
      (response) => {
        this.setUserDetails(response);
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.hasErrorUserWiseContentPerformanceAnaltics =  true;
      }
    )
  }

  setUserDetails(response: any) {
    this.userViewMore = response.UserContentAnalytics;
  }

  sort(data, sortOption, sortOrder) {
    var scope = this;
    scope[sortOrder] = !(scope[sortOrder]);
    var results = data.sort(function (a, b) {
      if (scope[sortOrder]) {
        return a[sortOption] - b[sortOption];
      } else {
        return b[sortOption] - a[sortOption];
      }
    });
  };
}
