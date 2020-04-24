import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Account/login/login.component';
import { HttpInterceptorProviders } from './httpInterceptors/http-interceptor-providers';
import { ForgotpasswordComponent } from './Account/forgotpassword/forgotpassword.component';
import { PasswordresetComponent } from './Account/passwordreset/passwordreset.component';
import { AppInsightsService } from './services/appinsights.service';
import { DatePipe } from '@angular/common';
import { NgxIziToastModule } from 'ngx-izitoast';
import { SaveChannelPointplanComponent } from './settings/points/points-modals/save-channel-pointplan/save-channel-pointplan.component';
import { DeleteChannelPointplanComponent } from './settings/points/points-modals/delete-channel-pointplan/delete-channel-pointplan.component';
import { ViewChannelPointplanComponent } from './settings/points/points-modals/view-channel-pointplan/view-channel-pointplan.component';
import { DragulaModule } from 'ng2-dragula';
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotpasswordComponent,
    PasswordresetComponent,
    DeleteChannelPointplanComponent,
    SaveChannelPointplanComponent,
    ViewChannelPointplanComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DragulaModule.forRoot(),
    ReactiveFormsModule,
    NgxIziToastModule,
    UiSwitchModule 
  ],
  providers: [HttpInterceptorProviders, DatePipe, AppInsightsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
