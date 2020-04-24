import { Injectable } from '@angular/core';
import { NgxIzitoastService } from 'ngx-izitoast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private iziToast: NgxIzitoastService) { }

  success(succesMessage: string) {
    this.iziToast.show({
      title: succesMessage,
      progressBarColor: "green",
      position: "topRight"
    });
  }

  error(errorMessage: string) {
    this.iziToast.show({
      title: errorMessage,
      progressBarColor: "red",
      position: "topRight"
    });
  }

  info(infoMessage: string) {
    this.iziToast.show({
      title: infoMessage,
      progressBarColor: "blue",
      position: "topRight"
    });
  }


  warning(warningMessage: string) {
    this.iziToast.show({
      title: warningMessage,
      progressBarColor: "orange",
      position: "topRight"
    });
  }

  notification(warningMessage: string) {
    this.iziToast.show({
      title: warningMessage,
      progressBarColor: "grey",
      position: "topRight"
    });
  }

}
