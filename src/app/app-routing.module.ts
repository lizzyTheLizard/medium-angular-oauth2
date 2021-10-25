import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateGuard } from './auth/private.guard';
import { AuthErrorPage } from './pages/auth-error/auth-error.page';
import { NotFoundPage } from './pages/not-found/not-found.page';
import { PrivatePage } from './pages/private/private.page';
import { PublicPage } from './pages/public/public.page';
import { Public2Page } from './pages/public2/public2.page';

const routes: Routes = [
  { path: 'public', component: PublicPage },
  { path: 'public2', component: Public2Page },
  { path: 'auth-error', component: AuthErrorPage },
  //This is an example for a private page, protected by an auth guard
  { path: 'private', component: PrivatePage, canActivate: [PrivateGuard] },
  { path: '', component: PublicPage },
  { path: '**', component: NotFoundPage },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
