import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { TeamsComponent } from './teams/teams.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UsersComponent } from './users/users.component';
import { LayoutModule } from '../sharedModules/layout.module';
import { CategoriesComponent } from './categories/categories.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PointsComponent } from './points/points.component';
import { SettingsLayoutComponent } from './settings-layout/settings-layout.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SmtpactivationComponent } from './smtpactivation/smtpactivation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChannelPointPlanComponent } from './points/channel-point-plan/channel-point-plan/channel-point-plan.component';
import { ChannelsComponent } from './channels/channels.component';
import { NgSelect2Module } from 'ng-select2';
import { ContentComponent } from './content/content.component';
import { DragulaModule } from 'ng2-dragula';
import { ConfigurationComponent } from './configuration/configuration.component';

@NgModule({
  declarations: [ 
    TeamsComponent,
    UsersComponent,
    CategoriesComponent,
    AnalyticsComponent,
    NotificationsComponent,
    PointsComponent,
    SettingsLayoutComponent,
    SmtpactivationComponent,
    SmtpactivationComponent,
    ChannelPointPlanComponent,
    ChannelsComponent,
    ContentComponent,
    ConfigurationComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    NgbModule,
    LayoutModule,
    UiSwitchModule, 
    ReactiveFormsModule,
    NgSelect2Module,
    DragulaModule
  ]
})
export class SettingsModule { }
