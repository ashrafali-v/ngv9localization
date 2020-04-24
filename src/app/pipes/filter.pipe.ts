import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(value: any, input: string, searchableList: string, serachableProperty?: any) {
        if (input) {
            input = input.toLowerCase();
            if(searchableList!='')
            {
               return value.filter(function(el: any) {
                let isTrue = false;
                if (serachableProperty) {
                    for (let k in serachableProperty) {
                        if (el[searchableList][serachableProperty[k]] !== '' && el[searchableList][serachableProperty[k]] !== null
                         && el[searchableList][serachableProperty[k]] !==  undefined && el[searchableList][serachableProperty[k]].toLowerCase().indexOf(input) > -1) {
                            isTrue = true;
                            return el;
                        }
                    }
                }

                else if (el[searchableList].toLowerCase().indexOf(input) > -1) {
                    return el;
                }

            });  
            }
           else{
            return value.filter(function(el: any) {
                let isTrue = false;
                if (serachableProperty) {
                    for (let k in serachableProperty) {
                        if (el[serachableProperty[k]] !== '' && el[serachableProperty[k]] !== null
                         && el[serachableProperty[k]] !==  undefined && el[serachableProperty[k]].toLowerCase().indexOf(input) > -1) {
                            isTrue = true;
                            return el;
                        }
                    }
                }

                else if (el.toLowerCase().indexOf(input) > -1) {
                    return el;
                }

            });  
           }
        }
        return value;
    }


}
