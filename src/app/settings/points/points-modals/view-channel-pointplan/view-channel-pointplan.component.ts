import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-channel-poiintplan',
  templateUrl: './view-channel-pointplan.component.html',
  styles: []
})
export class ViewChannelPointplanComponent implements OnInit {

  @Input() modalTitle: string;
  @Input() modalDescription: string;
  @Input() pointPlan: [];
  @Input() pointPlanName: string;
  @Input() pointPlanId: string;
  defaultPointPlan: any;
  PointPlanData: any = {};

  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit() {
  }

}
