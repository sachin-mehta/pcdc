import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaveSchoolEmailComponent } from './save-school-email/save-school-email.component';

const routes: Routes = [
  {
    path: '',
    component: SaveSchoolEmailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolEmailRegisterRoutingModule {}
