import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ConfirmschoolPage } from './confirmschool.page';
import { SharedModule } from '../shared/shared.module';
import { ConfirmschoolPageRoutingModule } from './confirmschool-routing.module';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { EnterKeyClickDirective } from '../shared/directives/enter-key-click.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmschoolPageRoutingModule,
    SharedModule,
  ],
  declarations: [ConfirmschoolPage, PcdcHeaderComponent, EnterKeyClickDirective],
})
export class ConfirmschoolPageModule {}
