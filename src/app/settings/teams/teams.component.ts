import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { Team } from '../Models/Team';
import { TeamContentSource } from '../Models/TeamContentSource';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { HelperService } from 'src/app/services/helper.service';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';
import { NgbModal, NgbModalRef, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html'
})
export class TeamsComponent implements OnInit {

  teamForm: FormGroup;
  editForm: FormGroup;

  Teams: any = [];
  addTeamModel = new Team();
  editTeamModel = new Team();
  deleteTeamModel = new Team();
  userListForTeam: any;
  selectedTeamId = 0;
  selectedTeamNameForUserList = '';
  removeModalRef: NgbModalRef;
  deleteModalRef: NgbModalRef;
  contentSourceListForTeam = new Array<TeamContentSource>();
  userTeamListForDelete: Observable<Array<Select2OptionData>>;
  selectedTeamIdForUserTeam = 0;
  teamSearchText = '';
  userSearchText = '';


  isTeamLoading = false;
  enableTeamEditing = true;
  teamCreateSubmitted = false;
  teamEditSubmitted = false;
  isTeamFetchError = false;
  isContentSourceFetchLoading = false;
  isTeamContentSourceReassignError = true;
  isEnableDeleteTeamButton = false;
  isTeamCreateLoading = false;
  isTeamEditLoading = false;
  isTeamDeleteLoading = false;

  teamCurrentPage = 1;
  teamPageSize = 10;

  isContentSourceStep = false;
  isUserStep = false;
  isConfirmStep = true;

  currentUserName = localStorage.getItem("Username");

  constructor(private settingsService: SettingsService, private apiService: ApiService, private toastService: ToastService,
    private modalService: NgbModal, private formBuilder: FormBuilder, private helperService: HelperService,
  ) { }

  ngOnInit() {
    this.teamForm = this.formBuilder.group({
      title: [{ value: '', disabled: !this.enableTeamEditing }, [Validators.required, Validators.maxLength(50),
      Validators.minLength(3), Validators.pattern('^[A-Za-z][a-zA-Z0-9@#()-.]*$')]],
    });
    this.editForm = this.formBuilder.group({
      title: [{ value: '', disabled: !this.enableTeamEditing }, [Validators.required, Validators.maxLength(50),
      Validators.minLength(3), Validators.pattern('^[A-Za-z][a-zA-Z0-9@#()-.]*$')]],
    });
    this.GetTeamSettings();
  }

  formControl() {
    return this.teamForm.controls;
  }

  editFormcontrol() {
    return this.editForm.controls;
  }

  GetTeamSettings() {
    this.teamCurrentPage = 1;
    this.isTeamLoading = true;
    this.isTeamFetchError = false;
    this.settingsService.getTeamSettings().subscribe(
      (success) => { this.SetTeamSettings(success); },
      (error) => {
        this.apiService.handleApiException(error);
        this.isTeamLoading = false;
        this.isTeamFetchError = true;
      }
    );
  }

  SetTeamSettings(response: any) {
    this.Teams = [];
    response.forEach(element => {
      var team = new Team();
      team.Title = element.Title;
      team.Description = element.Description;
      team.TeamId = element.TeamId;
      team.IsDefault = element.IsDefault;
      team.IsLeaderBoardViewEnabled = element.IsLeaderBoardViewEnabled;
      team.IsTeamLeaderBoard = element.IsTeamLeaderBoard;
      team.UserCount = element.UserCount;
      team.Selected = false;
      team.IsUserListForTeamLoading = false;
      this.Teams.push(team);
    });
    this.isTeamLoading = false;
  }

  setLeaderboard() {
    this.addTeamModel.IsTeamLeaderBoard = !(this.addTeamModel.IsTeamLeaderBoard);
  }

  editLeaderboard() {
    this.editTeamModel.IsTeamLeaderBoard = !(this.editTeamModel.IsTeamLeaderBoard);
  }

  addTeamPopUp(addTeam) {
    this.addTeamModel = new Team();
    this.teamForm.reset();
    this.teamCreateSubmitted = false;
    this.isTeamCreateLoading = false;
    this.modalService.open(addTeam, { size: 'lg', backdrop: 'static', keyboard: false, scrollable:true });
  }

  editTeamPopUp(editTeam, team) {

    this.editTeamModel = team;
    var teamName: string = team.Title;
    var isTeamLeaderBoard: boolean = team.IsTeamLeaderBoard;
    var isLeaderBoardViewEnabled: boolean = team.IsLeaderBoardViewEnabled;

    this.editForm.reset();
    this.teamEditSubmitted = false;
    this.isTeamEditLoading = false;

    this.removeModalRef = this.modalService.open(editTeam, { size: 'lg', backdrop: 'static', keyboard: false });

    // Resetting the selected team for removal on popover close or dismiss.
    this.removeModalRef.result.then((close) => {
      team.Title = teamName;
      team.IsLeaderBoardViewEnabled = isLeaderBoardViewEnabled;
      team.IsTeamLeaderBoard = isTeamLeaderBoard;
    },
      (dismiss) => {
        team.Title = teamName;
        team.IsLeaderBoardViewEnabled = isLeaderBoardViewEnabled;
        team.IsTeamLeaderBoard = isTeamLeaderBoard;
      });

  }

  deleteTeamPopUp(teamDelete, team) {
    this.deleteTeamModel = team;
    this.isContentSourceFetchLoading = true;
    this.isTeamDeleteLoading = false;
    this.settingsService.getContentSourceListForTeams(team.TeamId).subscribe(
      (success: []) => {
        this.setContentSourceListForTeam(success, teamDelete);
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.isContentSourceFetchLoading = false;
        this.toastService.error('Failed to fetch content source list.');
      }
    );
  }

  setContentSourceListForTeam(contentSourceList: [], teamDelete: any) {
    this.contentSourceListForTeam = contentSourceList;
    if (this.contentSourceListForTeam != null && this.contentSourceListForTeam.length > 0) {
      this.isContentSourceStep = true;
      this.isConfirmStep = false;
      this.isUserStep = false;
    }
    else {
      if (this.deleteTeamModel.UserCount > 0) {
        this.isUserStep = true;
        this.isContentSourceStep = false;
        this.isConfirmStep = false;
      }
      else {
        this.isEnableDeleteTeamButton = false;
      }
    }

    var teamListForContentSourceReassign = this.Teams;
    teamListForContentSourceReassign.slice(1);
    var teamDropDownList = [];

    teamListForContentSourceReassign.forEach(element => {
      teamDropDownList[element.TeamId] = element.Title;
    });

    var teamListForDropDown = this.helperService.createDropdownObservable(teamDropDownList);
    this.contentSourceListForTeam.forEach(element => {

      element.Teams = teamListForDropDown
    });

    this.userTeamListForDelete = teamListForDropDown;
    this.isContentSourceFetchLoading = false;
    this.deleteModalRef = this.modalService.open(teamDelete, { size: 'xl', backdrop: 'static', keyboard: false, scrollable: true });
    // Resetting the selected team for removal on popover close or dismiss.
    this.deleteModalRef.result.then((close) => {
      this.isTeamContentSourceReassignError = true;
      this.selectedTeamIdForUserTeam = 0;
      this.isEnableDeleteTeamButton = true;
      this.isUserStep = false;
      this.isContentSourceStep = false;
    },
      (dismiss) => {
        this.isTeamContentSourceReassignError = true;
        this.selectedTeamIdForUserTeam = 0;
        this.isEnableDeleteTeamButton = true;
        this.isUserStep = false;
        this.isContentSourceStep = false;
      });

  }

  editTeamSettings() {
    this.teamEditSubmitted = true;

    if (this.editForm.valid) {
      this.isTeamEditLoading = true;
      this.settingsService.editTeam(this.editTeamModel, this.currentUserName).subscribe(
        (success) => {
          this.isTeamEditLoading = false;
          this.setNewTeam(success, 'Team has been updated.');
        },
        (error) => {
          this.isTeamEditLoading = false;
          this.apiService.handleApiException(error);
          this.toastService.error(error.error.ExceptionMessage);
        }
      );

    }
  }

  addNewTeam() {
    this.teamCreateSubmitted = true;
    if (this.teamForm.valid) {
      this.isTeamCreateLoading = true;
      this.addTeamModel.Title = this.teamForm.value.title;
      this.settingsService.createTeam(this.addTeamModel, this.currentUserName).subscribe(
        (success) => {
          this.isTeamCreateLoading = false;
          this.setNewTeam(success, 'A new team has been created.');
        },
        (error) => {
          this.isTeamCreateLoading = false;
          this.apiService.handleApiException(error);
          this.toastService.error(error.error.ExceptionMessage);
        }
      );
    }
  }

  setNewTeam(newTeam: any, message: string) {
    this.modalService.dismissAll();
    this.toastService.success(message);
    this.GetTeamSettings();
  }

  getUserListForTeam(team: Team, teamuserlist: any) {
    team.IsUserListForTeamLoading = true;
    this.selectedTeamNameForUserList = team.Title;
    this.settingsService.getUserListForTeam(team.TeamId).subscribe(
      (success) => {
        this.setUserListForTeam(success, teamuserlist);
        team.IsUserListForTeamLoading = false;
      },
      (error) => {
        this.apiService.handleApiException(error);
        team.IsUserListForTeamLoading = false;
        this.toastService.error('Failed to fetch user list.');
      }
    );
  }

  setUserListForTeam(userList: any, teamuserlist: any) {
    this.userListForTeam = userList;
    this.modalService.open(teamuserlist, { size: 'xl' });
  }

  DeleteTeam() {
    this.isTeamDeleteLoading = true;
    this.settingsService.deleteTeam(this.deleteTeamModel.TeamId, this.selectedTeamIdForUserTeam, this.contentSourceListForTeam, this.currentUserName).subscribe(
      (success) => {
        this.isTeamDeleteLoading = false;
        this.setNewTeam(success, 'Team has been deleted.');
      },
      (error) => {
        this.isTeamDeleteLoading = false;
        this.toastService.error('Failed to delete team.');
      }
    );
  }

  beforeChange($event: NgbTabChangeEvent) {

    if ($event.activeId === 'team-contentsource') {
      this.contentSourceChange();
    }

    if ($event.activeId === 'team-user') {
      this.userTeamChange();
    }

    if ($event.activeId === 'team-confirm') {
      this.isEnableDeleteTeamButton = false;
    }

    if ($event.nextId === 'team-confirm') {
      this.isContentSourceStep = false;
      this.isUserStep = false;
      this.isConfirmStep = true;
      this.isEnableDeleteTeamButton = false;
    }

    if ($event.nextId === 'team-user') {
      this.isContentSourceStep = false;
      this.isUserStep = true;
      this.isConfirmStep = false;
    }

    if ($event.nextId === 'team-contentsource') {
      this.isContentSourceStep = true;
      this.isUserStep = false;
      this.isConfirmStep = false;
    }
  }

  contentSourceChange() {
    this.isTeamContentSourceReassignError = false;
    this.contentSourceListForTeam.forEach(element => {
      if (element.TeamId == 0) {
        this.isTeamContentSourceReassignError = true;
      }
    });
  }

  userTeamChange() {
    if (this.contentSourceListForTeam == undefined || this.contentSourceListForTeam.length == 0) {
      this.isTeamContentSourceReassignError = false;
    }
  }
}
