import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../settings.service';
import { ToastService } from 'src/app/services/toast.service';
import { ApiService } from 'src/app/services/api.service';
import { SocialMediaAccountsAndPageCount } from '../models/SocialMediaAccountsAndPageCount';
import { SocialMediaAccountPage } from '../models/SocialMediaAccountPage';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html'
})
export class ChannelsComponent implements OnInit, OnDestroy {
  selectedProvider = 'facebook';
  fbAccountCount: number;
  twitterAccountCount: number;
  linkedinAccountCount: number;
  instaAccountCount: number;
  youtubeAccountCount: number;
  socialMediaAccountsAndPageCount: any = [];
  socialMediaAccountPageList: any = [];
  isChannelListLoading: boolean;
  isChannelPageListLoading: boolean;
  channelListCurrentPage = 1;
  channelListPageSize = 10;
  channelPageListCurrentPage = 1;
  channelPageListPageSize = 10;
  channelSearchText: string;
  currentUserName = localStorage.getItem('Username');
  accountNameSelected: string;
  accountIdSelected: string;
  accountRemovalInProgress: boolean;
  pageNameSelected: string;
  pageIdSelected: string;
  enableOrDisableTextForSelectedPage: string;
  pageRemovalInProgress: boolean;
  removeModalRef: NgbModalRef;
  noPagesToDisplay: boolean;
  noAccountsToDisplay: boolean;
  pageActiveStatusToBeUpdated: boolean;
  enableOrDisablePageInProgress: boolean;
  removeAccountButtonDisabled: boolean;
  removeAccountConsentChecked: boolean;
  removePageButtonDisabled: boolean;
  removePageConsentChecked: boolean;
  contentSourceAssociated: any = [];
  facebookConnectionInProgress: boolean;
  twitterConnectionInProgress: boolean;
  linkedinConnectionInProgress: boolean;
  instagramConnectionInProgress: boolean;
  youtubeConnectionInProgress: boolean;
  private subs = new SubSink();
  isAnyFacebookAccountExpired: boolean;
  isAnyLinkedinAccountExpired: boolean;
  initialLoadSuccess: boolean = true;
  selectedChannel: SocialMediaAccountsAndPageCount;

  constructor(private settingsService: SettingsService, private toastService: ToastService,
    private apiService: ApiService, private modalService: NgbModal, private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.subs.sink = this.route.queryParams.subscribe(
      params => {
        if (params != null && params != undefined) {
          if (params.provider != null && params.provider != null &&
            params.success != null && params.success != null) {
            if (params.success == 'True') {
              this.toastService.success('A ' + params.provider + ' account has been connected.');
              this.selectedProvider = params.provider
            }
            else if (params.success == 'False') {
              this.toastService.error('Failed to connect to the social media account.')
              this.selectedProvider = params.provider;
            }
          }
          this.router.navigate(['settings/channels'])
        }
      }
    );

    this.getConnectedAccountCount();
    this.getConnectedAccountAndPageCount();
  }

  getConnectedAccountCount() {
    this.subs.sink = this.settingsService.getConnectedSocialMediaAccountCount().subscribe(
      (success: any) => {
        this.fbAccountCount = this.twitterAccountCount = this.linkedinAccountCount = 
        this.instaAccountCount = this.youtubeAccountCount = 0;
        success.forEach(element => {
          if (element.Provider === 'facebook') {
            this.fbAccountCount = element.ConnectionCount;
            this.isAnyFacebookAccountExpired = element.ExpiredConnectionCount;
          }
          if (element.Provider === 'instagram') {
            this.instaAccountCount = element.ConnectionCount;
          }
          if (element.Provider === 'linkedin') {
            this.linkedinAccountCount = element.ConnectionCount;
            this.isAnyLinkedinAccountExpired = element.ExpiredConnectionCount;
          }
          if (element.Provider === 'twitter') {
            this.twitterAccountCount = element.ConnectionCount;
          }
          if (element.Provider === 'youtube') {
            this.youtubeAccountCount = element.ConnectionCount;
          }
        });
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.initialLoadSuccess = false;
      }
    );
  }

  getConnectedAccountAndPageCount() {
    this.noAccountsToDisplay = false;
    this.channelListCurrentPage = 1;
    this.isChannelListLoading = true;
    this.channelSearchText = '';
    this.socialMediaAccountsAndPageCount = [];
    this.socialMediaAccountPageList = [];
    this.subs.sink = this.settingsService.getConnectedSocialMediaAccountsAndPageCount(this.selectedProvider).subscribe(
      (success: any) => {
        if (success != null && success != undefined) {
          success.forEach(channel => {
            let channelsAndPageCount = new SocialMediaAccountsAndPageCount();
            channelsAndPageCount.ProviderUserId = channel.ProviderUserId;
            channelsAndPageCount.ProviderUsername = channel.ProviderUsername;
            channelsAndPageCount.Username = channel.Username;
            channelsAndPageCount.ProfileImageUrl = channel.ProfileImageUrl != '' && channel.ProfileImageUrl != null ? channel.ProfileImageUrl : 'assets/images/avatar-001.jpg';
            channelsAndPageCount.TotalPageCount = channel.TotalPageCount;
            channelsAndPageCount.ModifiedBy = channel.ModifiedBy;
            channelsAndPageCount.ModifiedDate = channel.ModifiedDate;
            // Currently token expires for facebook and linkedin. For youtube token expires in 1 hour and 
            // refresh token is used to get data. So notifying admin user of account expiry is only set for
            // linkedin and facebook.
            channelsAndPageCount.ExpiresInDays = this.selectedProvider == 'facebook' || this.selectedProvider == 'linkedin' ?
              channel.ExpiresInDays : 1;
            channelsAndPageCount.IsPagesAssociatedWithAccount = channel.IsPagesAssociatedWithAccount;
            channelsAndPageCount.IsExpanded = false;
            this.socialMediaAccountsAndPageCount.push(channelsAndPageCount);
          });
        }

        this.isChannelListLoading = false;
        this.noAccountsToDisplay = this.socialMediaAccountsAndPageCount.length == 0 ? true : false;
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.initialLoadSuccess = false;
        this.isChannelListLoading = false;
      }
    )
  }

  showRemoveSocialMediaAccountModal(account: SocialMediaAccountsAndPageCount, templateName) {
    this.accountNameSelected = account.ProviderUsername;
    this.accountIdSelected = account.ProviderUserId;
    this.contentSourceAssociated = [];
    this.removeAccountButtonDisabled = true;
    this.removeAccountConsentChecked = false;
    this.getFeedsAssociatedWithAccount();
    this.removeModalRef = this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  showRemoveConnectedPageModal(page: SocialMediaAccountPage, templateName) {
    this.pageNameSelected = page.PageName;
    this.pageIdSelected = page.PageId;
    this.contentSourceAssociated = [];
    this.removePageButtonDisabled = true;
    this.removePageConsentChecked = false;
    this.getFeedsAssociatedWithPage();
    this.removeModalRef = this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  showEnableOrDisablePageModal(page: SocialMediaAccountPage, templateName) {
    this.pageNameSelected = page.PageName;
    this.pageIdSelected = page.PageId;
    this.accountIdSelected = page.ProviderUserId;
    this.pageActiveStatusToBeUpdated = page.ActiveStatus == 'Enabled' ? false : true;
    this.enableOrDisableTextForSelectedPage = page.ActiveStatus == 'Enabled' ? 'disable' : 'enable';
    this.removeModalRef = this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  showNotifyUserModal(account: SocialMediaAccountsAndPageCount, templateName) {
    this.accountNameSelected = account.ProviderUsername;
    this.selectedChannel = account;
    this.removeModalRef = this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  removeAccount() {
    this.accountRemovalInProgress = true;
    this.subs.sink = this.settingsService.deleteSocialMediaAccount(this.selectedProvider, this.accountIdSelected,
      this.accountNameSelected, this.currentUserName).subscribe(
        success => {
          this.toastService.success('Social media account has been deleted.');
          this.getConnectedAccountCount();
          this.getConnectedAccountAndPageCount();
          this.removeModalRef.close();
          this.accountRemovalInProgress = false;
        },
        error => {
          this.handleException(error, 'Failed to delete social media account.');
          this.removeModalRef.close();
          this.accountRemovalInProgress = false;
        }
      );
  }

  removePage() {
    this.pageRemovalInProgress = true;
    this.subs.sink = this.settingsService.deleteSocialMediaPage(this.selectedProvider, this.accountIdSelected,
      this.pageIdSelected, this.pageNameSelected, this.currentUserName).subscribe(
        success => {
          this.toastService.success('Social media page has been deleted.');
          this.getConnectedAccountAndPageCount();
          this.removeModalRef.close();
          this.pageRemovalInProgress = false;
        },
        error => {
          this.handleException(error, 'Failed to delete social media page.');
          this.removeModalRef.close();
          this.pageRemovalInProgress = false;
        }
      );
  }

  enableOrDisablePage() {
    this.enableOrDisablePageInProgress = true;
    this.socialMediaAccountPageList = [];
    this.isChannelPageListLoading = true;
    this.subs.sink = this.settingsService.enableOrDisableAPageInSocialMediaAccount(this.selectedProvider, this.accountIdSelected,
      this.pageIdSelected, this.pageActiveStatusToBeUpdated).subscribe(
        (success) => {
          this.toastService.success('Social media page has been updated.');
          this.listConnectedPages(this.accountIdSelected, false);
        },
        (error) => {
          this.handleException(error, 'Failed to update the social media page.');
        }
      );

    this.removeModalRef.close();
    this.enableOrDisablePageInProgress = false;
  }

  refreshSocialMediaPages(providerUserId: string, providerUsername: string) {
    this.socialMediaAccountsAndPageCount.forEach(element => {
      // Setting the table page list to expand for page list.
      if (element.ProviderUserId == providerUserId) {
        element.IsExpanded = true;
      } else {
        element.IsExpanded = false;
      }
    });
    this.socialMediaAccountPageList = [];
    this.isChannelPageListLoading = true;
    this.subs.sink = this.settingsService.refreshSocialMediaPages(this.selectedProvider, providerUserId).subscribe(
      success => {
        this.listConnectedPages(providerUserId, false);
        this.toastService.success("Pages in the social media account has been refreshed.");
      },
      error => {
        this.handleException(error, 'Failed to refresh the pages in the social media account.');
      }
    )
  }

  listConnectedPages(providerUserId: string, toggleTable: boolean) {
    this.accountIdSelected = providerUserId;
    if (toggleTable) {
      this.socialMediaAccountsAndPageCount.forEach(element => {
        // Setting the collapse/expand for page list.
        if (element.ProviderUserId == providerUserId) {
          element.IsExpanded = !element.IsExpanded;
        } else {
          element.IsExpanded = false;
        }
      });
    }
    else {
      this.socialMediaAccountsAndPageCount.forEach(element => {
        // This is the case when called after refreshing the pages. The refreshed account has to
        // display the pages so the table needs to be in expanded state
        if (element.ProviderUserId == providerUserId) {
          element.IsExpanded = true;
        } else {
          element.IsExpanded = false;
        }
      });
    }
    this.channelPageListCurrentPage = 1;
    this.socialMediaAccountPageList = [];
    this.isChannelPageListLoading = true;
    this.subs.sink = this.settingsService.getConnectedPagesInSocialMediaAccount(this.selectedProvider, providerUserId).subscribe(
      (success: any) => {
        if (success != null && success != undefined) {
          success.forEach(page => {
            let socialMediaPage = new SocialMediaAccountPage();
            socialMediaPage.ProviderUserId = page.ProviderUserId;
            socialMediaPage.PageName = page.PageName;
            socialMediaPage.PageId = page.PageId;
            socialMediaPage.ProfileImageUrl = page.ProfileImageUrl != '' && page.ProfileImageUrl != null ? page.ProfileImageUrl : 'assets/images/avatar-001.jpg';
            socialMediaPage.ActiveStatus = page.IsSelected ? 'Enabled' : 'Disabled';
            socialMediaPage.EnableDisableButtonText = page.IsSelected ? 'Disable' : 'Enable';
            this.socialMediaAccountPageList.push(socialMediaPage);
          });
        }

        this.isChannelPageListLoading = false;
        this.noPagesToDisplay = this.socialMediaAccountPageList.length == 0 ? true : false;
      },
      (error) => {
        this.handleException(error, 'Failed to list the connected pages in the account.');
      }
    )
  }

  showAddChannelPopup(templateName) {
    this.modalService.open(templateName, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  getFeedsAssociatedWithAccount() {
    this.subs.sink = this.settingsService.getFeedsAssociatedWithAccount(this.selectedProvider, this.accountIdSelected).subscribe(
      (success) => {
        this.contentSourceAssociated = success;
        this.removeAccountButtonDisabled = false;
      },
      (error) => {
        this.handleException(error, 'Failed to fetch associated content sources with account.');
      }
    )
  }

  getFeedsAssociatedWithPage() {
    this.subs.sink = this.settingsService.getFeedsAssociatedWithPage(this.selectedProvider, this.pageIdSelected).subscribe(
      (success) => {
        this.contentSourceAssociated = success;
        this.removePageButtonDisabled = false;
      },
      (error) => {
        this.handleException(error, 'Failed to fetch associated content sources with page.');
      }
    )
  }

  notifySocialMediaAccountExpiry(channel: SocialMediaAccountsAndPageCount) {
    channel.IsNotifyUserInProgress = true;
    this.subs.sink = this.settingsService.notifySocialMediaAccountExpiry(this.selectedProvider, channel.ProviderUsername,
      channel.Username, this.currentUserName).subscribe(
        success => {
          this.removeModalRef.close();
          this.toastService.success('User has been notified of the social media account expiry.');
          channel.IsNotifyUserInProgress = false;
        },
        error => {
          this.handleException(error, 'Failed to notify user of the social media account expiry.');
          channel.IsNotifyUserInProgress = false;
        }
      );
  }

  connectSocialMediaAccount(provider: string) {
    this.subs.sink = this.settingsService.connectSocialMediaAccount(provider, this.currentUserName).subscribe(
      (success: any) => {
        window.location.href = encodeURI(success);
      },
      error => {
        this.toastService.error("Failed to connect to " + provider + '.');
      }
    );
  }

  handleException(error: any, errorMessageToBeDisplayed: string) {
    this.apiService.handleApiException(error);
    this.toastService.error(errorMessageToBeDisplayed);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
