import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrivatePage } from './pages/private/private.page';
import { PublicPage } from './pages/public/public.page';
import { AuthGuard } from './auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    PrivatePage,
    PublicPage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://localhost:3000/info'],
        sendAccessToken: true
      }      
    })
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
