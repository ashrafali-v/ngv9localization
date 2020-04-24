import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private apiService: ApiService) { }

  createDropdownObservable(dropdownArray: any[], defaultId?: string, defaultText?: string) {
    let listArray = [];
    if (defaultId != null && defaultText != null) {
      listArray.push({ id: defaultId, text: defaultText });
    }

    let dropdownObservable: Observable<Array<Select2OptionData>>;
    for (let index in dropdownArray) {
      listArray.push({ id: index, text: dropdownArray[index] });
    }

    Observable.create((obs) => { obs.next(listArray); obs.complete(); }).
      subscribe((data) => { dropdownObservable = data; });
    return dropdownObservable;
  }

  nFormatter(num) {
    // Formats a number to alpha numeric value. For e.g., 1000 will be converted to 1K.
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
  }

  isTokenExpiredForAnySocialMediaChannel() {
    return this.apiService.getData('settings/istokenexpiredforanychannel', 1);
  }  
}
