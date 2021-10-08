import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'medium-angular-oauth2';
  loginFinished = false;

  constructor(private readonly oauthService: OAuthService) {
  }  

  async ngOnInit() {
    //Configure auth service, load discovery document
    this.oauthService.configure(environment.oidc);

    //Load the discovery document and check if this is a login response
    //If you want you application to always enforce login, replace this with loadDiscoveryDocumentAndLogin
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => this.loginFinished = true)
      .catch((e) => console.log(e));
  }
}
