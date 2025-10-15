import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { ContactUsRoutingModule } from './contact-us-routing.module';



@NgModule({
  declarations: [ContactUsComponent, PcdcHeaderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContactUsRoutingModule,
    IonicModule,
    SharedModule,
  ]
})
export class ContactUsModule { }
