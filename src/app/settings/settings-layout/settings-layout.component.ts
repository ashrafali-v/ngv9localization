import { Component, OnInit, OnDestroy } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-settings-layout',
  templateUrl: './settings-layout.component.html'
})
export class SettingsLayoutComponent implements OnInit, OnDestroy {  
  sideBarHideClass = ''; 
  hasExpiredTokens: boolean;
  private subs = new SubSink();

  constructor(private helper: HelperService) { }

  ngOnInit() {
    this.isTokenExpiredForAnySocialMediaChannel();
  }

  isTokenExpiredForAnySocialMediaChannel() {
    this.subs.sink = this.helper.isTokenExpiredForAnySocialMediaChannel().subscribe(
      success => {
        this.hasExpiredTokens = success ? true : false;        
      }
    );
  }

  toggleSidebar() {
    this.sideBarHideClass = this.sideBarHideClass == '' ? 'hidden' : '';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
