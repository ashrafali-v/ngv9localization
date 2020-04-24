import { Component, OnInit, OnDestroy, TestabilityRegistry } from '@angular/core';
import { SettingsService } from '../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { DragulaService } from 'ng2-dragula';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html'
})
export class ContentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoadingContentSettings = false;
  isContentSettingsFetchError = false;
  isSharingControlsFetchError = false;
  isSharingControlLoaderActive: boolean = true;
  contentSettings: any;
  currentUserName = localStorage.getItem("Username");
  blurbCountOptionsForNewUser = ['10', '25', '50', '75', '100', 'All'];
  selectedBlurbCountId = "5";
  blurbCountOptionsForNewUserList: Observable<Array<Select2OptionData>>;
  disclaimerConfigSubmitted = false;
  SharingControl: any = {};
  sharingControls: any = [];
  webControls: any = [];
  mobileControls: any = [];
  blurbIcons: any = [];
  blurbMoreIcons: any = [];
  blurbDisabledIcons: any = [];
  blurbIconsMob: any = [];
  blurbMoreIconsMob: any = [];
  blurbDisabledIconsMob: any = [];
  isEnableSaveForBlurbCount = false;
  isSavingBlurbCountInProgress = false;
  isSavingDisclaimerText = false;
  newUserBlurbCount: string = "";
  disclaimerText: string = "";

  private observableSubscriptions = new SubSink();
  constructor(private settingsService: SettingsService, private apiService: ApiService, private helperSerive: HelperService,
    private formBuilder: FormBuilder, private toastService: ToastService, private dragulaService: DragulaService) {
    this.dragulaService.createGroup("blurbchannels", {
      accepts: (el, target, source, sibling) => {
        if (source.id == target.id) {
          return true;
        } else {
          /*prevent more than 4 sharing controls are add to the blurb section */
          if (target.id == "blurb-sharing-web-intent" && target.children.length == 4) {
            return false;
          }
          else {
            return true;
          }
        }
      }
    });
    this.observableSubscriptions.add(this.dragulaService.dropModel("blurbchannels").subscribe(args => {
      var container = args.target.getAttribute('data-target');
      this.webControls.forEach(element => {
        /*Updating the source container element index when an element is removed*/
        if (element.DispIayIconOrder > args.sourceIndex + 1 && element.DisplayIconSection == args.source.getAttribute('data-target')) {
          element.DispIayIconOrder -= 1;
        }
        /*Updating the target container element index when an element is added*/
        if (element.DispIayIconOrder >= args.targetIndex + 1 && element.DisplayIconSection == args.target.getAttribute('data-target')) {
          element.DispIayIconOrder += 1;
        }
        if (element.Name == args.item.Name) {
          /*Update the droped element details after a drop*/
          if (container == "disabled") {
            element.Value = "false";
            element.DisplayIconSection = container;
            element.DispIayIconOrder = args.targetIndex + 1;
          } else {
            element.Value = "true";
            element.DisplayIconSection = container;
            element.DispIayIconOrder = args.targetIndex + 1;
          }
        }
      });
      this.settingsService.modifySharingControl(this.webControls).subscribe(data => {
        this.toastService.success('Sharing control has been updated.');
      }, err => {
        this.apiService.handleApiException(err);
        this.toastService.error('Failed to update sharing control.');
      });
      return true;
    }));
    this.dragulaService.createGroup("blurbchannelsmob", {
      accepts: (el, target, source, sibling) => {
        if (source.id == target.id) {
          return true;
        } else {
          /*prevent more than 4 sharing controls are add to the blurb section */
          if (target.id == "blurb-sharing-mob-intent" && target.children.length == 4) {
            return false;
          }
          else {
            return true;
          }
        }
      }
    });
    this.observableSubscriptions.add(this.dragulaService.dropModel("blurbchannelsmob").subscribe(args => {
      var container = args.target.getAttribute('data-target');
      this.mobileControls.forEach(element => {
        /*Updating the source container element index when an element is removed*/
        if (element.DispIayIconOrder > args.sourceIndex + 1 && element.DisplayIconSection == args.source.getAttribute('data-target')) {
          element.DispIayIconOrder -= 1;
        }
        /*Updating the target container element index when an element is added*/
        if (element.DispIayIconOrder >= args.targetIndex + 1 && element.DisplayIconSection == args.target.getAttribute('data-target')) {
          element.DispIayIconOrder += 1;
        }
        if (element.Name == args.item.Name) {
          /*Update the droped element details after a drop*/
          if (container == "disabled") {
            element.Value = "false";
            element.DisplayIconSection = container;
            element.DispIayIconOrder = args.targetIndex + 1;
          } else {
            element.Value = "true";
            element.DisplayIconSection = container;
            element.DispIayIconOrder = args.targetIndex + 1;
          }
        }
      });
      this.settingsService.modifySharingControl(this.mobileControls).subscribe(data => {
        this.toastService.success('Sharing control has been updated.');
      }, err => {
        this.apiService.handleApiException(err);
        this.toastService.error('Failed to update sharing control.');
      });
      return true;
    }, err => {
      this.apiService.handleApiException(err);
    }));
  }

  ngOnInit() {
    this.getContentSettings();
    this.blurbCountOptionsForNewUserList = this.helperSerive.createDropdownObservable(this.blurbCountOptionsForNewUser);
    this.buildForm();
    this.form.disable();

    this.observableSubscriptions.add(this.settingsService.getSharingControls().subscribe(data => {
      this.isSharingControlLoaderActive = false;
      this.isSharingControlsFetchError = false;
      this.sharingControls = data;
      this.webControls = this.sharingControls.SharingControl.WebControls;
      this.mobileControls = this.sharingControls.SharingControl.MobileControls;
      this.webControls.forEach(element => {
        if (element.DisplayIconSection == "blurb" && element.Value == "true") {
          this.blurbIcons.push(element);
        } else if (element.DisplayIconSection == "more" && element.Value == "true") {
          this.blurbMoreIcons.push(element);
        } else {
          element.DisplayIconSection = "disabled";
          this.blurbDisabledIcons.push(element);
        }
      });
      this.mobileControls.forEach(element => {
        if (element.DisplayIconSection == "blurb" && element.Value == "true") {
          this.blurbIconsMob.push(element);
        } else if (element.DisplayIconSection == "more" && element.Value == "true") {
          this.blurbMoreIconsMob.push(element);
        } else {
          element.DisplayIconSection = "disabled";
          this.blurbDisabledIconsMob.push(element);
        }
      });
    }, err => {
      this.apiService.handleApiException(err);
      this.isSharingControlsFetchError = true;
    }));
  }

  ngOnDestroy() {
    this.observableSubscriptions.unsubscribe();
    this.dragulaService.destroy("blurbchannels");
    this.dragulaService.destroy("blurbchannelsmob");
  }
  buildForm() {
    this.form = this.formBuilder.group({
      disclaimerText: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }


  getContentSettings() {
    this.isLoadingContentSettings = true;
    this.isContentSettingsFetchError = false;
    this.observableSubscriptions.add(this.settingsService.getContentSettings().subscribe(
      (success) => { this.setContentSettings(success); },
      (error) => {
        this.apiService.handleApiException(error);
        this.isLoadingContentSettings = false;
        this.isContentSettingsFetchError = true;
      }
    ));
  }

  setContentSettings(response: any) {
    this.contentSettings = response;
    this.blurbCountOptionsForNewUserList.forEach(element => {
      if (element["text"] == response.NewUserBlurbCount) {
        this.selectedBlurbCountId = element["id"];
        this.newUserBlurbCount = element["id"];
      }
    });

    this.disclaimerText = this.contentSettings.DisclaimerText;

    this.form.patchValue({
      disclaimerText: this.contentSettings.DisclaimerText
    });

    if (this.contentSettings.DisclaimerTextEnabled) {
      this.form.enable();
    }

    this.isLoadingContentSettings = false;
    this.isContentSettingsFetchError = false;
  }

  cancelDisclaimerTextEdit() {
    this.form.patchValue({
      disclaimerText: this.disclaimerText
    });
  }

  cancelNewBlurbCountEdit() {
    this.selectedBlurbCountId = this.newUserBlurbCount;
    this.isEnableSaveForBlurbCount = false;
  }


  updateFormControlView(contentSettingName: string, contentSettingValueBool: boolean) {
    if (this.contentSettings.DisclaimerTextEnabled) {
      this.form.enable();
    }
    else {
      this.form.disable();
    }

    this.updateContentSettings(contentSettingName, contentSettingValueBool);
  }

  updateContentSettings(contentSettingName: string, contentSettingValueBool?: boolean) {
    var contentSettingValue = "";
    if (contentSettingValueBool != undefined) {
      contentSettingValue = contentSettingValueBool.toString();
    }

    else if (contentSettingName == 'NewUserBlurbCount') {
      contentSettingValue = this.blurbCountOptionsForNewUser[this.selectedBlurbCountId];
      this.isSavingBlurbCountInProgress = true;
    }
    else if (contentSettingName == 'DisclaimerText') {
      contentSettingValue = this.form.value.disclaimerText;
      this.isSavingDisclaimerText = true;
    }

    this.observableSubscriptions.add(this.settingsService.updateContentSettings(contentSettingName, contentSettingValue, this.currentUserName).subscribe(
      (success) => {
        this.toastService.success('Content setting has been updated.');
        if (contentSettingName == 'NewUserBlurbCount') {
          this.isSavingBlurbCountInProgress = false;
          this.isEnableSaveForBlurbCount = false;
          this.newUserBlurbCount = this.selectedBlurbCountId;
        }
        else if (contentSettingName == 'DisclaimerText') {
          this.isSavingDisclaimerText = false;
          this.disclaimerText = contentSettingValue;
        }
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.toastService.error('Failed to update content setting.');
      }
    ));
  }

  formControl() {
    return this.form.controls;
  }

  saveDisclaimerText() {
    this.disclaimerConfigSubmitted = true;
    if (this.form.valid) {
      this.updateContentSettings('DisclaimerText');
    }
  }

  enableSaveForNewUseBlurbCount() {
    this.isEnableSaveForBlurbCount = true;
  }
}
