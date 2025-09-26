import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StarttestPage } from './starttest.page';
import { TestDetailComponent } from './test-detail/test-detail.component';

const routes: Routes = [
  {
    path: '',
    component: StarttestPage,
  },{
    path: 'detail-page/:id',
    component: TestDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StarttestPageRoutingModule {}
