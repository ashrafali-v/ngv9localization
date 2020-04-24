import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { AuthGuard } from '../authGuard/auth.guard';
import { TeamsComponent } from './teams/teams.component';
import { UsersComponent } from './users/users.component';
import { CategoriesComponent } from './categories/categories.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PointsComponent } from './points/points.component';
import { SettingsLayoutComponent } from './settings-layout/settings-layout.component';
import { SmtpactivationComponent } from './smtpactivation/smtpactivation.component';
import { ChannelsComponent } from './channels/channels.component';
import { ContentComponent } from './content/content.component';
import { ConfigurationComponent } from './configuration/configuration.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/settings/channels',
        pathMatch: 'full'
      },
      {
        path: 'teams',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: TeamsComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'users',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: UsersComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'categories',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: CategoriesComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'channels',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: ChannelsComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'analytics',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: AnalyticsComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'notifications',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: NotificationsComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'points',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: PointsComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'configurations',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: ConfigurationComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'smtpactivation',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: SmtpactivationComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'content',
        component: SettingsLayoutComponent,
        children: [
          { path: '', component: ContentComponent, canActivate: [AuthGuard] }
        ]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
