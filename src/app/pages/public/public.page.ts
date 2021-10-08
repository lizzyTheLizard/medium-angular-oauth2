import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-public',
  templateUrl: './public.page.html',
  styleUrls: ['./public.page.css']
})
export class PublicPage implements OnInit {
  isLoggedIn = false;

  constructor(private readonly oauthService: OAuthService) { 
  }

  ngOnInit(){
    this.isLoggedIn = this.oauthService.getIdentityClaims() != null;
  }
  
  login(){
    this.oauthService.initLoginFlow();
  }

  logout(){
    this.oauthService.logOut();
    this.isLoggedIn = false;
  }
}
