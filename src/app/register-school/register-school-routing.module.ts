import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterSchoolPageComponent } from './register-school-page/register-school-page.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterSchoolPageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegisterSchoolRoutingModule {}
