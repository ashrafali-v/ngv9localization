import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HelperService } from '../services/helper.service';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: []
})
export class LayoutComponent implements OnInit, OnDestroy {  
  tenantLogoUrl: string;
  userName: string;
  userProfileImage: string;
  userRole: string;
  hasExpiredTokens: boolean;
  settingsSubMenuCollapsed = true;
  private subs = new SubSink();

  constructor(private authService: AuthService, private helper: HelperService, private route: Router) {
    this.tenantLogoUrl = localStorage.getItem('tenantLogo') != null ? localStorage.getItem('tenantLogo') : '';
    this.userName = localStorage.getItem('Username') != null ? localStorage.getItem('Username') : '';
    this.userProfileImage = localStorage.getItem('UserProfileImage') != null ? localStorage.getItem('UserProfileImage') : '';
    this.userRole = localStorage.getItem('UserRole') != null ? localStorage.getItem('UserRole') : '';
   }

  ngOnInit() {
    this.settingsSubMenuCollapsed = this.route.url.startsWith('/settings') ? false : true;
    this.isTokenExpiredForAnySocialMediaChannel();
  }  

  isTokenExpiredForAnySocialMediaChannel() {
    this.subs.sink = this.helper.isTokenExpiredForAnySocialMediaChannel().subscribe(
      success => {
        this.hasExpiredTokens = success ? true : false;        
      }
    );
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
