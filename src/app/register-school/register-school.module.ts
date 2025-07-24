import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterSchoolPageComponent } from './register-school-page/register-school-page.component';
import { PcdcHeaderComponent } from '../pcdc-header/pcdc-header.component';
import { SharedModule } from '../shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { RegisterSchoolRoutingModule } from './register-school-routing.module';
import { EnterKeyClickDirective } from '../shared/directives/enter-key-click.directive';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [RegisterSchoolPageComponent, PcdcHeaderComponent, EnterKeyClickDirective],
  imports: [
    CommonModule,
    SharedModule,
    IonicModule,
    RegisterSchoolRoutingModule,
    FormsModule
  ]
})
export class RegisterSchoolModule { }
