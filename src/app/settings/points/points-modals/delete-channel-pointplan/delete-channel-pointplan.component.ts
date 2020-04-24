import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from '../../../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-delete-channel-pointplan',
  templateUrl: './delete-channel-pointplan.component.html'
})
export class DeleteChannelPointplanComponent implements OnInit {
  @Input() modalTitle: string;
  @Input() pointPlanName: string;
  @Input() pointPlanId: string;
  deletePointPlane: any;
  constructor(public settingServ: SettingsService, public activeModal: NgbActiveModal, private apiService: ApiService, private toastService: ToastService) { }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.deletePointPlane.unsubscribe();
  }
  deletePointPlan(pointPlanId: any) {
    this.deletePointPlane = this.settingServ.deletePointPlan(pointPlanId).subscribe(data => {
      this.activeModal.close("deleted");
    }, err => {
      this.apiService.handleApiException(err);
      this.toastService.error("Failed to delete point plan.");
    });
  }
}
