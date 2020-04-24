import * as moment from 'moment';
declare var $: any;

export class DaterangepickerService {

  constructor(private dateRangeSelector: string,private enableTimePicker: boolean) {
    $(function() {
      let start = moment().subtract(14, 'days');
      let end = moment();

      function cb(start, end) {
        $(dateRangeSelector + ' span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      }

      $(dateRangeSelector).daterangepicker({
        startDate: start,
        timePicker: enableTimePicker,
        endDate: end,
        opens: 'center',
        ranges: {
          'This Week': [moment().startOf('week'), moment().endOf('week')],
          'Last Week': [moment().startOf('week').subtract(1, 'week'), moment().endOf('week').subtract(1, 'week')],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)), moment(new Date(new Date().getFullYear(), (new Date().getMonth() - 1) + 1, 0))],
          'This Quarter': [moment().startOf('quarter'), moment().endOf('quarter')],
          'Last Quarter': [moment().startOf('quarter').subtract(1, 'quarter'), moment().endOf('quarter').subtract(1, 'quarter')],
          'This Year': [moment().startOf('year'), moment().endOf('year')],
          'Last Year': [moment().startOf('year').subtract(1, 'year'), moment().endOf('year').subtract(1, 'year')]
        }
      }, cb);

      cb(start, end);

    });
   }   
}
