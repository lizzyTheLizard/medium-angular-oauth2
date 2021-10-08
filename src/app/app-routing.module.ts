import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivatePage } from './pages/private/private.page';
import { PublicPage } from './pages/public/public.page';

const routes: Routes = [
  { path: 'private', component: PrivatePage },
  { path: '', component: PublicPage },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
