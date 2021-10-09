import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { PrivatePage } from './pages/private/private.page';
import { PublicPage } from './pages/public/public.page';


const routes: Routes = [
  //This is an example for a private page, protected by an auth guard
  { path: 'private', component: PrivatePage, canActivate: [AuthGuard]},
  { path: '', component: PublicPage },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
