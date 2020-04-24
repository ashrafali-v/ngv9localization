import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharesandengagementsComponent } from './sharesandengagements/sharesandengagements.component';
import { GoogleanalyticsComponent } from './googleanalytics/googleanalytics.component';
import { TopadvocatesComponent } from './topadvocates/topadvocates.component';
import { TopblurbsComponent } from './topblurbs/topblurbs.component';
import { ContentperformanceanalyticsComponent } from './contentperformanceanalytics/contentperformanceanalytics.component';
import { EarnedmediavalueComponent } from './earnedmediavalue/earnedmediavalue.component';
import { NgSelect2Module } from 'ng-select2';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AppInsightsService } from '../services/appinsights.service';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { LayoutModule } from '../sharedModules/layout.module';


@NgModule({
  declarations: [SharesandengagementsComponent,
    GoogleanalyticsComponent,
    TopadvocatesComponent,
    TopblurbsComponent,
    ContentperformanceanalyticsComponent,
    EarnedmediavalueComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    NgSelect2Module,
    UiSwitchModule,
    DashboardRoutingModule,
    LayoutModule,
    NgbModule,
    NgCircleProgressModule.forRoot({
      "backgroundPadding": 6,
      "radius": 60,
      "toFixed": 0,
      "maxPercent": 100,
      "space": -10,
      "outerStrokeWidth": 10,
      "innerStrokeWidth": 10,
      "subtitleFontSize": '25',
      "subtitleFontWeight": '700',
      "animateTitle": false,
      "animation": true,
      "animationDuration": 1000,
      "showTitle": false,
      "showUnits": false,
      "showBackground": false,
      "showImage": false,
      "responsive": true,
      "showSubtitle": true
    })
  ],
  providers: [DatePipe, AppInsightsService]
})
export class DashboardModule { }
