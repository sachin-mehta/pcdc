import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SearchschoolPage } from './searchschool.page';
import { SharedModule } from '../shared/shared.module';
import { SearchschoolPageRoutingModule } from './searchschool-routing.module';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { EnterKeyClickDirective } from '../shared/directives/enter-key-click.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchschoolPageRoutingModule,
    SharedModule,
  ],
  declarations: [SearchschoolPage, PcdcHeaderComponent, EnterKeyClickDirective],
})
export class SearchschoolPageModule {}
