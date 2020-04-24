import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SettingsService } from '../settings.service';
import { SaveChannelPointplanComponent } from "./points-modals/save-channel-pointplan/save-channel-pointplan.component";
import { ApiService } from 'src/app/services/api.service';
import { SubSink } from 'subsink';
import { PointPlan } from "../../settings/Models/PointPlan";
import { ToastService } from 'src/app/services/toast.service';


@Component({
  selector: "app-points",
  templateUrl: "./points.component.html"
})
export class PointsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  points: any = [];
  channelPointPlan: any = [];
  oneTimeActivities: any = [];
  regularActivities: any = [];
  pointPlan: any = [];
  savedPointPlan: any = {};
  updatedPointPlan: any = [];
  isPointPlanLoaderActive: boolean = false;
  isCreateLoaderActive: boolean = false;
  dafaultPointPlanName: string;
  isCreateButtonActive: boolean = true;
  isPointPlanFetchError: boolean = false;
  updateOneTimeActivityLoaderStatus: boolean = false;
  updateRegularActivityLoaderStatus: boolean = false;
  editOnetimeModalRef: any;
  editRegularModalRef: any;
  createddPlanDetails: PointPlan;
  isFormValueChangeOneTime: boolean = false;
  isFormValueChangeRegular: boolean = false;
  private observableSubscriptions = new SubSink();

  constructor(private settingServ: SettingsService, private modalService: NgbModal, private apiService: ApiService, private toastService: ToastService) { }
  ngOnInit() {
    this.getPointPlan();
  }
  ngOnDestroy() {
    this.observableSubscriptions.unsubscribe();
  }
  getPointPlan() {
    this.channelPointPlan = [];
    this.isPointPlanLoaderActive = true;
    this.observableSubscriptions.add(this.settingServ.getPointPlan().subscribe(data => {
      this.isPointPlanFetchError = false;
      this.isPointPlanLoaderActive = false;
      this.isLoading = false;
      if (data != null && data != undefined) {
        data.ChannelPointPlan.forEach(element => {
          let pointPlanDetails = new PointPlan();
          pointPlanDetails.Id = element.Id;
          pointPlanDetails.Name = element.Name;
          pointPlanDetails.IsActive = element.IsActive;
          pointPlanDetails.IsDefault = element.IsDefault;
          pointPlanDetails.AssociatedContentCount = element.AssociatedContentCount;
          pointPlanDetails.AssociatedContentSourceCount = element.AssociatedContentSourceCount;
          this.channelPointPlan.push(pointPlanDetails);
        });
        this.oneTimeActivities = data.OneTime;
        this.regularActivities = data.Regular;
        this.dafaultPointPlanName = this.channelPointPlan[0].Name;
      }
    }, err => {
      this.isPointPlanFetchError = true;
      this.apiService.handleApiException(err);
    }));
  }
  createChannelPointPlanModal() {
    this.isCreateLoaderActive = true;
    this.observableSubscriptions.add(this.settingServ.createPointPlan().subscribe(data => {
      this.isCreateLoaderActive = false;
      const createModalRef = this.modalService.open(SaveChannelPointplanComponent, {
        ariaLabelledBy: "modal-basic-title",
        size: "xl",
        scrollable: true,
        backdrop: 'static'
      });
      createModalRef.componentInstance.modalTitle = "Create Channel Point Plan";
      createModalRef.componentInstance.modalDescription = "Create new point plan";
      createModalRef.componentInstance.pointPlan = data.DefaultPointPlan;
      createModalRef.componentInstance.pointPlanName = "";
      createModalRef.componentInstance.pointPlanId = "";
      createModalRef.componentInstance.isPointPlanActive = true;
      createModalRef.componentInstance.isCreate = true;
      createModalRef.componentInstance.emitService.subscribe((result) => {
        if (result) {
          this.observableSubscriptions.add(this.settingServ.savePointPlan(result, localStorage.getItem("Username")).subscribe(data => {
            createModalRef.close();
            let details = { Id: data.PointPlan.PointPlanId, Name: result.PointPlanName, IsActive: result.isPointPlanActive, AssociatedContentSourceCount: 0, AssociatedContentCount: 0 };
            this.channelPointPlan.splice(1, 0, details);
            this.toastService.success("A new point plan has been created.");
          }, err => {
            this.apiService.handleApiException(err);
            this.toastService.error("Failed to create a point plan.");
          }));
        }
      }, (reason) => {
        console.log(reason);
      });
    }, err => {
      this.apiService.handleApiException(err);
    }));
  }
  editOnetimeActivity(editOA) {
    this.isFormValueChangeOneTime = false;
    this.editOnetimeModalRef = this.modalService.open(editOA, { size: 'lg', scrollable: true, backdrop: 'static' });
  }
  updateOneTimeActivity(result) {
    this.updateOneTimeActivityLoaderStatus = true;
    if (result) {
      this.updatedPointPlan = {
        OneTime: result
      }
      this.settingServ.saveRegularAndOnetime(this.updatedPointPlan).subscribe(data => {
        this.updateOneTimeActivityLoaderStatus = false;
        this.editOnetimeModalRef.close();
        this.oneTimeActivities = [];
        var oneTimeData = Object.keys(result).map(key => {
          return result[key];
        })
        oneTimeData.forEach(element => {
          element.SettingsId = parseInt(element.SettingsId);
          element.DisplayName = element.Name;
          this.oneTimeActivities.push(element);

        });
        this.toastService.success("One time activity has been updated.");
      }, err => {
        this.apiService.handleApiException(err);
        this.toastService.error("Failed to update one time activity.");
      });
    }
  }
  editRegularActivity(editRA) {
    this.isFormValueChangeRegular = false;
    this.editRegularModalRef = this.modalService.open(editRA, { size: 'lg', scrollable: true, backdrop: 'static' });
  }
  updateRegularActivity(result) {
    this.updateRegularActivityLoaderStatus = true;
    if (result) {
      this.updatedPointPlan = {
        Regular: result
      }
      this.settingServ.saveRegularAndOnetime(this.updatedPointPlan).subscribe(data => {
        this.updateRegularActivityLoaderStatus = false;
        this.editRegularModalRef.close();
        this.regularActivities = [];
        var regularData = Object.keys(result).map(key => {
          return result[key];
        })
        regularData.forEach(element => {
          element.SettingsId = parseInt(element.SettingsId);
          element.DisplayName = element.Name;
          this.regularActivities.push(element);

        });
        this.toastService.success("Regular activity has been updated.");
      }, err => {
        this.apiService.handleApiException(err);
        this.toastService.error("Failed to update regular activity.");
      });
    }
  }
  tabChangeEvent() {
    this.isCreateButtonActive = false;
  }
  tabChangeEventChannel() {
    this.isCreateButtonActive = true;
  }
  onSearchChange(e) {
    this.isFormValueChangeOneTime = true;
    this.isFormValueChangeRegular = true;
  }
  confirmationOneTime() {
    var r = confirm("Unsaved changes will be discarded, do you wish to continue?");
    if (r == true) {
      this.editOnetimeModalRef.close();
    } else {
    }
  }
  confirmationRegular() {
    var r = confirm("Unsaved changes will be discarded, do you wish to continue?");
    if (r == true) {
      this.editRegularModalRef.close();
    } else {
    }
  }
}
