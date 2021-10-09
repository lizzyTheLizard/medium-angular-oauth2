import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-public',
  templateUrl: './public.page.html',
  styleUrls: ['./public.page.css']
})
export class PublicPage {
  readonly isLoggedIn$: Observable<boolean>;

  constructor(private readonly oauthService: OAuthService) { 
    //A user is logged if there is a valid token. Update with every event and start with the current value
    this.isLoggedIn$ = this.oauthService.events.pipe(
      map(() => this.oauthService.hasValidAccessToken()),
      startWith(this.oauthService.hasValidAccessToken()),
    );
  }
  
  login(){
    this.oauthService.initLoginFlow();
  }

  logout(){
    this.oauthService.logOut();
  }
}
