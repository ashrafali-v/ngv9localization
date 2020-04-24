import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from '../../../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { SubSink } from 'subsink';
import { fromEvent } from 'rxjs';
import { NgForm } from '@angular/forms';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-action-channel-pointplan',
  templateUrl: './save-channel-pointplan.component.html'
})
export class SaveChannelPointplanComponent implements OnInit {
  @Input() modalTitle: string;
  @Input() modalDescription: string;
  @Input() pointPlan: [];
  @Input() pointPlanName: string;
  @Input() pointPlanId: string;
  @Input() isPointPlanActive: boolean;
  @Input() isCreate: boolean;
  @Output() emitService = new EventEmitter();
  /*Get form value chnage event of  createPointForm*/
  @ViewChild('createPointForm') createPointForm: NgForm;
  isFormValueChange: boolean = false;
  defaultPointPlan: any;
  PointPlanData: any = {};
  savedPointPlan: any = {};
  isPointPlanNameValid: boolean = false;
  validationBoxStatus: boolean = true;
  isEditPointPlanLoaderActive: boolean = false;
  constructor(public activeModal: NgbActiveModal, public settingServ: SettingsService, private apiService: ApiService) { }

  ngOnInit() {
    if (!this.isCreate) {
      this.validationBoxStatus = false;
      this.isPointPlanNameValid = true;
    }
    let pointPlanKeyUp = fromEvent(document.getElementById('point-plan-name'), 'keyup');
    pointPlanKeyUp.pipe(
      map(key => (<HTMLInputElement>key.target).value),
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(pointPlanName => {
      this.isFormValueChange = true;
      if (pointPlanName == "" || pointPlanName.length < 3) {
        this.validationBoxStatus = true;
        this.isPointPlanNameValid = false;
      } else {
        this.isPointPlanNameValid = true;
      }
    });
    setTimeout(() => {
      /*Get form value chnage event of  createPointForm*/
      this.createPointForm.valueChanges.subscribe(selectedValue => {
        this.isFormValueChange = true;
      })
    });

  }
  savePointPlan(formData: any) {
    this.PointPlanData = {
      PointPlan: formData,
      PointPlanName: this.pointPlanName,
      pointPlanId: this.pointPlanId,
      isPointPlanActive: this.isPointPlanActive
    }
    this.isEditPointPlanLoaderActive = true;
    this.emitService.next(this.PointPlanData)
  }
  confirmation() {
    var r = confirm("Unsaved changes will be discarded, do you wish to continue?");
    if (r == true) {
      this.activeModal.close();
    } else {
    }
  }
  pointPlanStatus() {
    this.isFormValueChange = true;
  }
}
