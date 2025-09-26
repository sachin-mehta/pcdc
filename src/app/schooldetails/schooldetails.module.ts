import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SchooldetailsPage } from './schooldetails.page';
import { SharedModule } from '../shared/shared.module';
import { SchooldetailsPageRoutingModule } from './schooldetails-routing.module';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { EnterKeyClickDirective } from '../shared/directives/enter-key-click.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchooldetailsPageRoutingModule,
    SharedModule,
  ],
  declarations: [SchooldetailsPage, PcdcHeaderComponent, EnterKeyClickDirective],
})
export class SchooldetailsPageModule {}
