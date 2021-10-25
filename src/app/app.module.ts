import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PublicPage } from './pages/public/public.page';
import { Public2Page } from './pages/public2/public2.page';
import { AuthErrorPage } from './pages/auth-error/auth-error.page';
import { PrivatePage } from './pages/private/private.page';
import { NotFoundPage } from './pages/not-found/not-found.page';

import { AuthModule } from './auth/auth.module';

@NgModule({
  declarations: [
    AppComponent,
    PublicPage,
    Public2Page,
    AuthErrorPage,
    PrivatePage,
    NotFoundPage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
