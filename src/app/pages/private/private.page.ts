import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.css']
})
export class PrivatePage implements OnInit {
  userInfo: object = {};

  constructor(private readonly oauthService: OAuthService) { 
  }

  ngOnInit(){
    this.userInfo = this.oauthService.getIdentityClaims();
  }
}
