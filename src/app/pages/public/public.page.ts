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
    this.isLoggedIn$ = this.oauthService.events.pipe(
        startWith(this.oauthService.getIdentityClaims()),
        map(() => this.oauthService.getIdentityClaims() != null),
      );
  }
  
  login(){
    this.oauthService.initLoginFlow();
  }

  logout(){
    this.oauthService.logOut();
  }
}
