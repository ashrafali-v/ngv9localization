import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { SaveChannelPointplanComponent } from "../../points-modals/save-channel-pointplan/save-channel-pointplan.component"
import { DeleteChannelPointplanComponent } from "../../points-modals/delete-channel-pointplan/delete-channel-pointplan.component"
import { ViewChannelPointplanComponent } from "../../points-modals/view-channel-pointplan/view-channel-pointplan.component"
import { SettingsService } from '../../../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { SubSink } from 'subsink';
import { PointPlan } from "../../../Models/PointPlan";
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'channel-point-plan',
  templateUrl: './channel-point-plan.component.html'
})
export class ChannelPointPlanComponent implements OnInit, OnDestroy {
  @Input() channelPointPlan: any;
  @Input() defaultPlan: any;
  @Output() getPointPlan: EventEmitter<any> = new EventEmitter();
  @ViewChild('popOver') public popover: NgbPopover;
  pointName: string;
  channeEnabled: boolean = true;
  contentsourceCount: number = 0;
  contentCount: number = 0;
  pointPlanSearchText: string;
  savedPointPlan: any = {};
  currentPage: any = 1;
  pageSize: any = 10;
  contentSourceList: any = [];
  pointPlanName: string = '';
  pointPlanId: any;
  createPointPlanButton: boolean = true;
  moreInfoLoaderStatus: boolean = false;
  isLoaderActive: boolean = false;
  updatedPlanDetails: PointPlan;
  isMoreInfoLoaderActive: boolean = false;
  isViewPlanLoaderActive: boolean = false;
  isEditPlanLoaderActive: boolean = false;
  isCopyPlanLoaderActive: boolean = false;
  private observableSubscriptions = new SubSink();
  constructor(private modalService: NgbModal, public settingServ: SettingsService, private apiService: ApiService, private toastService: ToastService) { }
  ngOnInit() {
  }
  ngOnDestroy() {
    this.observableSubscriptions.unsubscribe();
    this.createPointPlanButton = false;
  }
  moreInfo(infobox, points: PointPlan) {
    this.pointPlanName = points.Name;
    this.pointPlanId = points.Id;
    this.contentsourceCount = points.AssociatedContentSourceCount;
    this.contentCount = points.AssociatedContentCount;
    points.isMoreInfoLoaderActive = true;
    this.observableSubscriptions.add(this.settingServ.getContentSourceList(points.Id).subscribe(data => {
      this.contentSourceList = data.ContentSources;
      points.isMoreInfoLoaderActive = false;
      this.modalService.open(infobox, { size: 'xl', scrollable: true, backdrop: 'static' });
    }, err => {
      this.apiService.handleApiException(err);
    }));

  }
  viewChannelPointPlan(points: PointPlan) {
    points.isViewPlanLoaderActive = true;
    this.observableSubscriptions.add(this.settingServ.editPointPlan(points.Id).subscribe(data => {
      points.isViewPlanLoaderActive = false;
      const modalRef = this.modalService.open(ViewChannelPointplanComponent, {
        ariaLabelledBy: "modal-basic-title",
        size: "xl",
        scrollable: true,
        backdrop: 'static'
      });
      modalRef.componentInstance.modalTitle = "View Channel Point Plan";
      modalRef.componentInstance.pointPlan = data.PointPlan.PointPlan;
      modalRef.componentInstance.pointPlanName = data.PointPlan.PointPlanName;
      modalRef.componentInstance.pointPlanId = data.PointPlan.PointPlanId;
    }, err => {
      this.apiService.handleApiException(err);
    }));
  }
  editChannelPointPlan(points: PointPlan, index, popOverElement) {
    this.isEditPlanLoaderActive = true;
    this.observableSubscriptions.add(this.settingServ.editPointPlan(points.Id).subscribe(data => {
      popOverElement.close();
      this.isEditPlanLoaderActive = false;
      const editPointPlanModalRef = this.modalService.open(SaveChannelPointplanComponent, {
        ariaLabelledBy: "modal-basic-title",
        size: "xl",
        scrollable: true,
        backdrop: 'static'
      });
      var self = this;
      editPointPlanModalRef.componentInstance.modalTitle = "Edit Channel Point Plan";
      editPointPlanModalRef.componentInstance.modalDescription = "Edit current point plan";
      editPointPlanModalRef.componentInstance.pointPlan = data.PointPlan.PointPlan;
      editPointPlanModalRef.componentInstance.pointPlanName = data.PointPlan.PointPlanName;
      editPointPlanModalRef.componentInstance.pointPlanId = data.PointPlan.PointPlanId;
      editPointPlanModalRef.componentInstance.isPointPlanActive = points.IsActive;
      editPointPlanModalRef.componentInstance.isCreate = false;
      editPointPlanModalRef.componentInstance.emitService.subscribe((result) => {
        if (result) {
          this.observableSubscriptions.add(this.settingServ.savePointPlan(result, localStorage.getItem("Username")).subscribe(data => {
            editPointPlanModalRef.close();
            points.Name = result.PointPlanName;
            points.IsActive = result.isPointPlanActive;
            this.channelPointPlan[index] = points;
            this.toastService.success("Point plan has been updated.");
          }, err => {
            this.apiService.handleApiException(err);
            this.toastService.error("Failed to update point plan.");
          }));
        }
      }, (reason) => {
        console.log(reason);
      });
    }, err => {
      this.apiService.handleApiException(err);
    }));

  }

  copyChannelPointPlan(pointPlanId, popOverElement) {
    this.isCopyPlanLoaderActive = true;
    this.observableSubscriptions.add(this.settingServ.copyPointPlan(pointPlanId).subscribe(data => {
      this.isCopyPlanLoaderActive = false;
      popOverElement.close();
      this.channelPointPlan.splice(1, 0, data.CopyOfPointPlan);
      this.toastService.success("Point plan has been duplicated.");
    }, err => {
      this.apiService.handleApiException(err);
      this.toastService.error("Failed to duplicate point plan.");
    }));
  }
  deleteChannelPointPlan(pointPlanId, pointPlanName, pointPlanIndex, popOverElement) {
    popOverElement.close();
    const deletePointPlanModalRef = this.modalService.open(DeleteChannelPointplanComponent, {
      ariaLabelledBy: "modal-basic-title",
      size: "xl",
      scrollable: true,
      backdrop: 'static'
    });
    deletePointPlanModalRef.componentInstance.modalTitle = "Delete Channel Point Plan";
    deletePointPlanModalRef.componentInstance.pointPlanName = pointPlanName;
    deletePointPlanModalRef.componentInstance.pointPlanId = pointPlanId;
    deletePointPlanModalRef.result.then((deleteStatus) => {
      if (deleteStatus) {
        this.channelPointPlan.splice(pointPlanIndex, 1);
        this.toastService.success("Point plan has been deleted.");
      }
    }, (reason) => {
      console.log(reason);
    });

  }
  downloadPointPlan(pointPlanId: string, poinPlantName: string) {
    this.observableSubscriptions.add(this.settingServ.exportPointPlan(pointPlanId).subscribe(res => {
      this.downLoadFile(res, poinPlantName);
    }, err => {
      this.apiService.handleApiException(err);
    }));

  }
  enableDisablePointPlan(status: any, pointPlanId: any) {
    this.observableSubscriptions.add(this.settingServ.enableDisablePointPlan(pointPlanId, status).subscribe(data => {
    }, err => {
      this.apiService.handleApiException(err);
    }));
  }
  setasDefaultChannelPointPlan(setasDefaultModal, pointPlanId: any, pointPlanName: string, popOverElement) {
    this.pointPlanName = pointPlanName;
    popOverElement.close();
    const setDefaultModalRef = this.modalService.open(setasDefaultModal, { size: 'xl', scrollable: true, backdrop: 'static' });
    setDefaultModalRef.result.then((result) => {
      if (result) {
        this.observableSubscriptions.add(this.settingServ.setasDefaultPointPlan(pointPlanId).subscribe(data => {
          this.getPointPlan.emit();
        }, err => {
          this.apiService.handleApiException(err);
        }));
      }
    }, (reason) => {
      console.log(reason);
    });

  }
  downloadContentSource(pointPlanId: string, poinPlantName: string) {
    this.observableSubscriptions.add(this.settingServ.exportPointPlanContentSource(pointPlanId).subscribe(res => {
      this.downLoadFile(res, poinPlantName);
    }, err => {
      this.apiService.handleApiException(err);
    }));
  }
  downloadContent(pointPlanId: string, poinPlantName: string) {
    this.observableSubscriptions.add(this.settingServ.exportPointPlanContent(pointPlanId).subscribe(res => {
      this.downLoadFile(res, poinPlantName);
    }, err => {
      this.apiService.handleApiException(err);
    }));
  }
  downLoadFile(res, pointPlanName) {
    const blob: Blob = new Blob([res], { type: 'text/csv' });
    const fileName: string = pointPlanName + '.csv';
    const objectUrl: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;

    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    this.toastService.success("Point plan has been downloaded.");
  }
  openActionsPopover(event): void {
    if (!this.popover.isOpen()) {
      this.popover.open();
    } else {
      this.popover.close();
    }
  }
  closePopover(): void {
    if (this.popover.isOpen()) this.popover.close();
  }
}
