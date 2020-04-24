import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { DaterangepickerService } from 'src/app/services/daterangepicker.service';
import { Chart } from 'chart.js';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';


declare var $: any;

@Component({
  selector: 'app-earnedmediavalue',
  templateUrl: './earnedmediavalue.component.html',
  styleUrls: []
})


export class EarnedmediavalueComponent implements OnInit {
  startDate = moment().subtract(14, 'days').format('DD MMM YYYY');;
  endDate = moment().format('DD MMM YYYY');
  granularEarnedMediaValueAnalytics: any;
  tenantOrganization: string;
  dateRangeService: DaterangepickerService;
  fullScreenToggleClass = "normalScreen";
  emvChart: any;
  metrics: Observable<Array<Select2OptionData>>;
  selectedMetrics = "FacebookLikeValue";
  isTrending = true;
  percent = "50";
  subtitle = "50";
  subtitleColor = "#61ab86";
  outerStrokeColor = "#6dd19f";
  innerStrokeColor = "#d4e8de";
  emvGraphIsLoading = false;
  hasError = false;
  trendTotal = 0;
  trendDiff = 0;
  isGraphExpanded = false;

  constructor(private dashboardService: DashboardService, private apiService: ApiService, private helperService: HelperService) {
    this.tenantOrganization = localStorage.getItem('tenantOrganization') != null ? localStorage.getItem('tenantOrganization') : '';
    this.dateRangeService = new DaterangepickerService('#emvdaterange', false);
  }

  ngOnInit() {
    const self = this;

    $('#emvdaterange').on('apply.daterangepicker', function (ev, picker) {
      self.startDate = picker.startDate.format('YYYY-MM-DD');
      self.endDate = picker.endDate.format('YYYY-MM-DD');
      self.getGranularEarnedMediaValueAnalytics(self.startDate, self.endDate);
    });

    $('.remove-collapse').on('click', function (e) {
      e.stopPropagation();
    });
  }

  initialLoadData() {
    this.isGraphExpanded = !this.isGraphExpanded;
    if (this.isGraphExpanded) {
      this.getEMVMetrics();
      this.getGranularEarnedMediaValueAnalytics(this.startDate, this.endDate);
    }
  }

  getGranularEarnedMediaValueAnalytics(startDate: any, endDate: any) {
    this.emvGraphIsLoading = true;
    this.hasError = false;
    this.dashboardService.getGranularEarnedMediaValueAnalytics(startDate, endDate).subscribe(
      (response) => {
        this.setGranularEarnedMediaValueAnalytics(response);
        this.emvGraphIsLoading = false;
      },
      (error) => {
        this.hasError = true;
        this.apiService.handleApiException(error);
      })
  }

  getEMVMetrics() {
    this.dashboardService.getEMVMetrics().subscribe(
      (response) => {
        this.setEMVMetrics(response);
      },
      (error) => { this.apiService.handleApiException(error); }
    )
  }

  setEMVMetrics(response) {
    this.metrics = this.helperService.createDropdownObservable(response.Metrics);
  }

  setGranularEarnedMediaValueAnalytics(response) {
    this.granularEarnedMediaValueAnalytics = response.EarnMediaValueAnalytics;
    this.setTrend(response.Trend);
    this.loadChart();
  }

  setTrend(trend: any) {
    this.percent = trend.Percentage;
    this.subtitle = this.helperService.nFormatter(trend.Percentage) + "%";
    this.isTrending = trend.IsTrendingUp || trend.IsTrendingStright;
    this.subtitleColor = this.isTrending ? "#61ab86" : "#e24e72";
    this.outerStrokeColor = this.isTrending ? "#6dd19f" : "#F8426E";
    this.innerStrokeColor = this.isTrending ? "#d4e8de" : "#efd8dc";
    this.trendTotal = this.helperService.nFormatter(this.granularEarnedMediaValueAnalytics.CurrentEarnedMediaValueAnalytics.Total);
    this.trendDiff = this.helperService.nFormatter(this.isTrending ? trend.Difference : -trend.Difference);
  }

  toggleFullscreenView() {
    this.fullScreenToggleClass = this.fullScreenToggleClass === 'normalScreen' ? 'fullScreen' : 'normalScreen';
  }

  getAnalyticsByMetrics() {
    const chartData = this.chartJsData(this.granularEarnedMediaValueAnalytics, this.selectedMetrics);
    if (this.emvChart != null) {
      this.emvChart.data.datasets.forEach(function (dataset, datasetIndex) {
        dataset.data.shift();
      });
    }
    this.emvChart.data = chartData;
    this.emvChart.update();
  }

  loadChart() {
    this.emvChart = new Chart('emvChart', {
      type: 'line',
      data: this.chartJsData(this.granularEarnedMediaValueAnalytics, this.selectedMetrics),
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
      }
    });
  }

  chartJsData(granularEarnedMediaValueAnalytics: any, selectedMetrics: string) {
    let dataSets: { label: string, data: number, lineTension: number, fill: boolean, borderWidth: number, borderColor: string, backgroundColor: string }[] = [];

    dataSets.push({
      'label': selectedMetrics,
      'data': granularEarnedMediaValueAnalytics.GranularEarnedMediaValueAnalytics.map(function (c) {
        return c[selectedMetrics];
      })
      ,
      'lineTension': 0.2,
      'fill': true,
      'borderWidth': 2,
      'borderColor': '#ff9d76',
      'backgroundColor': 'rgba(255,157,118,0.4)'
    });

    return {
      datasets: dataSets,
      labels: granularEarnedMediaValueAnalytics.GranularEarnedMediaValueAnalytics.map(function (c) {
        return c.Date;
      })
    };
  }

  refreshEMVGraph() {
    this.getGranularEarnedMediaValueAnalytics(this.startDate, this.endDate);
  }
}



