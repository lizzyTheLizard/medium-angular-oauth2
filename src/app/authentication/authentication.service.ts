import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {
  readonly userInfo$: Observable<object>;
  readonly isLoggedIn$: Observable<boolean>;
  readonly loggedOut$: Observable<void>;
  readonly loginFinished$: Observable<boolean>;
  private readonly loginFinishedSubject: Subject<boolean>;
  private readonly loggedOutSubject: Subject<void>;
  private readonly eventSubscription: Subscription;
  private loginAlreadyStarted: boolean = false;

  constructor(private readonly oauthService: OAuthService, private readonly router: Router) { 
    //Update user infos and login state with every event
    this.userInfo$ = this.oauthService.events.pipe(
      startWith({}),
      map(() => this.oauthService.getIdentityClaims())
    );
    this.isLoggedIn$ = this.oauthService.events.pipe(
      startWith({}),
      map(() => this.oauthService.hasValidAccessToken())
    );

    //We also need to know if we are logged out in e.g. another tab
    this.loggedOutSubject = new Subject();
    this.loggedOut$ = this.loggedOutSubject.asObservable();

    //Track the state of the login
    this.loginFinishedSubject = new Subject<boolean>();
    this.loginFinished$ = this.loginFinishedSubject.asObservable();

    //Track login events
    this.eventSubscription = this.oauthService.events.subscribe(e => this.handleLoginEvent(e));

    this.initializeLogin();
  }

  async initializeLogin() {
    try {
      //Configure auth service, load discovery document
      this.oauthService.configure(environment.oidc);
      this.oauthService.setupAutomaticSilentRefresh();

      //Load the discovery document and check if this is a login response
      //If you want you application to always enforce login, replace this with loadDiscoveryDocumentAndLogin
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      //If not logged in, try a silent refresh to log in if there is a session at auth server
      //but ingore any errors
      if( !this.isCurentlyLoggedIn() && !this.loginAlreadyStarted){
        await this.tryLoginWithoutUserInteraction();
      }
    } catch (e) {
      //The login code could not be initialized... So lets go to the error page...
      console.error('Could not initialize login', e);
      this.router.navigateByUrl('login-error');
    }
    this.loginFinishedSubject.next(true);
  }

  ngOnDestroy(): void {
    if(!this.eventSubscription?.closed) {
      this.eventSubscription.unsubscribe();
    }
  }

  private handleLoginEvent(e: OAuthEvent) {
    if(e.type == "token_received") {
      //A login was successfull... Lets go to the URL the user originally intended
      const state = this.oauthService.state;
      if(state) {
        this.router.navigateByUrl(decodeURIComponent(state));
      }
    }

    //The session has been terminated somehow... We need to inform the user
    if(e.type === "session_terminated") {
      this.loggedOutSubject.next();
    }
  }

  isCurentlyLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  login(){
    this.loginAlreadyStarted = true;
    this.oauthService.initLoginFlow(this.router.url);
  }

  loginOnRoute(route: string){
    this.loginAlreadyStarted = true;
    this.oauthService.initLoginFlow(route);
  }

  private async tryLoginWithoutUserInteraction(){
    this.loginAlreadyStarted = true;
    try {
      await this.oauthService.silentRefresh();
    } catch (e) {
      console.log('Not yet logged in');
    }
    this.loginAlreadyStarted = false;
  }

  logout(){
    this.oauthService.logOut();
    this.navigateToLogoutPage();
  }

  navigateToLogoutPage(){
    this.router.navigateByUrl('/');
  }
}
