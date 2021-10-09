import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrivatePage } from './pages/private/private.page';
import { PublicPage } from './pages/public/public.page';
import { AuthGuard } from './authentication/auth.guard';
import { Public2Page } from './pages/public2/public2.page';
import { AuthenticationService } from './authentication/authentication.service';
import { LoginErrorPage } from './pages/login-error/login-error.page';
import { NotFoundPage } from './pages/not-found/not-found.page';

@NgModule({
  declarations: [
    AppComponent,
    PrivatePage,
    PublicPage,
    Public2Page,
    LoginErrorPage,
    NotFoundPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    //Load the module and add the access token to the defined requests
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://localhost:3000/info'],
        sendAccessToken: true
      }      
    })
  ],
  providers: [AuthGuard, AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
