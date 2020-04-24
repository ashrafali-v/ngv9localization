import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { ApiService } from 'src/app/services/api.service';
import { Moment } from 'moment';
import * as moment from 'moment';
import { DaterangepickerService } from 'src/app/services/daterangepicker.service';
import { DatePipe } from '@angular/common'; 

declare var $: any;
@Component({
  selector: 'app-topadvocates',
  templateUrl: './topadvocates.component.html',
  styleUrls: []
})
export class TopadvocatesComponent implements OnInit {
  topAdvocatesResponse: any;
  topAdvocatesSerch: any;
  selected: { startDate: Moment, endDate: Moment };
  topAdvocateSearch: any;
  filterText: any; 
  dateRangeService: DaterangepickerService;
  isLoadingTopAdvocates = false;
  searchableList = 'User';
  serachableProperty = ['DisplayName','Email'];
  searchText = '';

  constructor(private dashboardService: DashboardService,private apiService: ApiService, private datepipe: DatePipe) { 
    this.dateRangeService = new DaterangepickerService('#tadaterange',false);
  }   

  ngOnInit() {
    const self=this;
    const endDateInitial = moment().subtract(14, 'days').format('DD MMM YYYY');
    const startDateInitial = moment().format('DD MMM YYYY');
    this.populateTopAdvocates(endDateInitial, startDateInitial);

    $('#tadaterange').on('apply.daterangepicker', function(ev, picker) {
      const start = picker.startDate.format('DD MMM YYYY');
      const end = picker.endDate.format('DD MMM YYYY');
      self.populateTopAdvocates(start, end);
    });
    
  }
  
  populateTopAdvocates(start, end) {
    this.isLoadingTopAdvocates = true;
    this.dashboardService.getTopAdvocates(start, end).subscribe(
      (response) => {
        this.setTopAdvocates(response);
        this.isLoadingTopAdvocates = false;
      });

  }
  setTopAdvocates(topAdvocates) {
    this.topAdvocatesResponse = topAdvocates.TopAdvocatesByDate;
    this.topAdvocateSearch = topAdvocates.TopAdvocatesByDate;

  }
  assignCopy() {
    this.topAdvocatesResponse = Object.assign([], this.topAdvocateSearch);
  }
  filterItem(value) {
    if (!value.target.value) {
      this.assignCopy();
    }

    this.topAdvocatesResponse = this.topAdvocateSearch.filter(function(advocates) {
      // this.filterText=value.target.value;
      if (advocates.User.DisplayName === value.target.value) {
        return true;
      }
      return advocates.User.DisplayName.toLowerCase().indexOf(value.target.value.toLowerCase()) > -1;
    });

  }

}
