import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SchoolsuccessPage } from './schoolsuccess.page';

import { SchoolsuccessPageRoutingModule } from './schoolsuccess-routing.module';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { SharedModule } from '../shared/shared.module';
import { EnterKeyClickDirective } from '../shared/directives/enter-key-click.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchoolsuccessPageRoutingModule,
    SharedModule,
  ],
  declarations: [SchoolsuccessPage, PcdcHeaderComponent, EnterKeyClickDirective],
})
export class SchoolsuccessPageModule {}
