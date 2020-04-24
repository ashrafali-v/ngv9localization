import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import * as moment from 'moment';
import { DaterangepickerService } from 'src/app/services/daterangepicker.service';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe } from '@angular/common'; 

declare var $: any;

@Component({
  selector: 'app-topblurbs',
  templateUrl: './topblurbs.component.html',
  styleUrls: []
})

 
export class TopblurbsComponent implements OnInit {

  topBlurbs: any;
  chosenMod = 'shares';
  searchableList = 'Blurb';
  serachableProperty = ['Title', 'Description', 'Comment'];
  searchText = '';
  isLoadingTopBlurbs = false;

  dateRangeService: DaterangepickerService;

  constructor(private dashboardService: DashboardService, private apiService: ApiService, private datepipe: DatePipe) {
    this.dateRangeService = new DaterangepickerService('#tbdaterange',false);
  }

  ngOnInit() {
    const self = this;
    const endDateInitial = moment().subtract(14, 'days').format('DD MMM YYYY');
    const startDateInitial = moment().format('DD MMM YYYY');
    this.changeDate(endDateInitial, startDateInitial);

    $('#tbdaterange').on('apply.daterangepicker', function(ev, picker) {
      const start = picker.startDate.format('DD MMM YYYY');
      const end = picker.endDate.format('DD MMM YYYY');
      self.changeDate(start, end);
    });
  }

  setTopBlurbs(data: any) {
    this.topBlurbs = data.TrendingBlurbs;
    this.sortTopBlurb();
  }

  changeDate(start, end) {
    this.isLoadingTopBlurbs = true;
    this.dashboardService.getTopBlurbsByDate(end, start).subscribe(
      (response) => {
        this.setTopBlurbs(response);
        this.isLoadingTopBlurbs = false;
      },
      (error) => { this.apiService.handleApiException(error); }
    );
  }

  sortTopBlurb() {
    if (this.chosenMod === 'shares') {
      this.topBlurbs.sort(function(a, b) {
        return b.Shares.Total - a.Shares.Total;
      });
    }

    else if (this.chosenMod === 'engagements') {
      this.topBlurbs.sort(function(a, b) {
        return b.Engagements.Total - a.Engagements.Total;
      });
    }

    else {
      this.topBlurbs.sort(function(a, b) {
        return (b.Engagements.Total + b.Shares.Total) - (a.Engagements.Total + a.Shares.Total);
      });
    }
  }
}
