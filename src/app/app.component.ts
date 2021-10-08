import { Component, OnDestroy, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'medium-angular-oauth2';
  loginFinished = false;
  waiter: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly oauthService: OAuthService) {
  }  

  async ngOnInit() {
    //Configure auth service, load discovery document
    this.oauthService.configure(environment.oidc);
    this.oauthService.setupAutomaticSilentRefresh();

    //Load the discovery document and check if this is a login response
    //If you want you application to always enforce login, replace this with loadDiscoveryDocumentAndLogin
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();

    //If not logged in, try a silent refresh to log in if there is a session at auth server
    //but ingore any errors
    if(!this.oauthService.getIdentityClaims()){
      await this.checkIfLoggedIn();
    }
    this.loginFinished = true;

    //If still not logged in, try a silent refresh periodically
    this.waiter = setInterval(() => this.checkIfLoggedIn(), 5000);
  }

  async checkIfLoggedIn(){
    try {
      await this.oauthService.silentRefresh();
    } catch (e) {
      console.log('Not logged in');
    }
  }

  ngOnDestroy(): void {
    if(this.waiter) {
      clearInterval(this.waiter);
      this.waiter = undefined;
    }
  }
}
