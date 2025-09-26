import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { SharedModule } from '../shared/shared.module';
import { HomePageRoutingModule } from './home-routing.module';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { EnterKeyClickDirective } from '../shared/directives/enter-key-click.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule
    
  ],
  declarations: [HomePage, PcdcHeaderComponent,EnterKeyClickDirective],
})
export class HomePageModule {}
