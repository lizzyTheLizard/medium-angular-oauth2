import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { OAuthModule } from 'angular-oauth2-oidc';
import { PrivatePage } from '../pages/private/private.page';
import { AuthService } from './auth.service';

@NgModule({
  imports: [
    HttpClientModule,
    NgIdleKeepaliveModule.forRoot(),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://localhost:3000/info'],
        sendAccessToken: true
      }      
    }),
  ],
  providers: [PrivatePage, AuthService],
})
export class AuthModule { }
