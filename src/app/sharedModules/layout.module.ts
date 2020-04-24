import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { NgbPopoverModule, NgbTooltipModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { FilterPipe } from '../pipes/filter.pipe';

@NgModule({
  declarations: [
    LayoutComponent,
    FilterPipe
  ],
  imports: [
    CommonModule,
    NgbPopoverModule,
    RouterModule,
    NgbTooltipModule,
    NgbCollapseModule
  ],
  exports: [
    LayoutComponent,
    FilterPipe
  ]
})
export class LayoutModule { }
