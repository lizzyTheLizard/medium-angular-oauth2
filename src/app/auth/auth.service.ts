import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { distinctUntilChanged, filter, map, Observable, startWith, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserInfo } from './user-info';


const minimalTokenValiditySeconds = 30;
const keepAliveIntervalSeconds =  5;
const inactivityTimeoutSeconds = 30;
const afterLogoutURL = '/';
const oidcConfig: AuthConfig = {
  issuer: environment.auth.issuer,
  clientId:'angular-client',
  scope: 'openid profile email',
  showDebugInformation: false,
  //showDebugInformation: !environment.production,
  responseType: 'code',
  redirectUri: window.location.origin + '/',
  sessionChecksEnabled: true,
  useSilentRefresh: false,
  silentRefreshRedirectUri: window.location.origin + '/assets/silent-refresh.html',
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly isLoggedIn$: Observable<boolean>;
  readonly userInfo$: Observable<UserInfo | null>;
  readonly setupFinished$: Observable<boolean>;
  private loginAlreadyStarted: boolean = false;

  constructor(private readonly oauthService: OAuthService, 
              private readonly router: Router,
              private readonly idle: Idle, 
              private readonly keepalive: Keepalive) { 
    //Set up the observables
    const setupFinishedSubject = new Subject<boolean>();
    this.setupFinished$ =  setupFinishedSubject.asObservable();
    this.userInfo$ = this.createUserInfo$();
    this.isLoggedIn$ = this.createIsLoggedIn$();

    //Initialize the parts
    this.initializeIdleLibrary();
    this.initializeOAuthLibrary().then(() => setupFinishedSubject.next(true));
  }

  private async initializeOAuthLibrary(){
    //After a successful login we need to go to the URL the user originally intended
    //as after a logout we only end up at / again
    //We stored the original URL in the state (see login function)
    this.oauthService.events.pipe(
      filter(e => e.type === "token_received"),
      map(() => this.oauthService.state),
      filter((state): state is string => !!state),
      map(state => decodeURIComponent(state)),
    ).subscribe(url => this.router.navigateByUrl(url));
    
    //Configure auth and initialize login
    this.oauthService.configure(oidcConfig);
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      if(this.isCurrentlyLoggedIn()){
        //If we are already logged in, were fine
        return;
      }
      //It might be that we are already login in on the auth server, to check this
      //lets make a silent login
      //If we need the user to be logged-in all the time (e.g. there is no public part)
      //we could also just start a "normal" login instead
      await this.trySilentRefresh();
    } catch (e) {
      console.error('Could not initialize login', e);
      this.router.navigateByUrl('auth-error');
    }
  }

  private async trySilentRefresh(): Promise<void> {
    //If might be that a login has already been started e.g. by the auth guard
    if(this.loginAlreadyStarted){
      return;
    }

    this.loginAlreadyStarted = true;
    try {
      console.debug('Start silent refresh');
      await this.oauthService.silentRefresh()
    } catch (e) {
      //Ignore as not needed, were just not logged in
      console.debug('silent refresh failed', e);
    }
    this.loginAlreadyStarted = false;
  } 
   
  private initializeIdleLibrary(){
    //Configure the idle timeout
    this.idle.setIdle(inactivityTimeoutSeconds);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onIdleStart.subscribe(() => console.debug("User is idle, do not update token any more"));
    this.idle.onIdleEnd.subscribe(() => console.debug("User is not idle any more"));
    //Configure keepalive, this will update the token regularly as long as you are active
    this.keepalive.interval(keepAliveIntervalSeconds);
    this.keepalive.onPing.subscribe(() => this.updateAccessToken());
    this.idle.setAutoResume(1);
    this.idle.watch();
  }

  private updateAccessToken() {
    if(!this.oauthService.hasValidAccessToken()) {
      //User is not logged in, do not update token
      return;
    }
    const exp = this.oauthService.getAccessTokenExpiration() ?? 0;
    const expIn = exp - Date.now();
    if(expIn < minimalTokenValiditySeconds * 1000){
      console.debug("Token expires in", expIn, "start update")
      this.trySilentRefresh();
    } else {
      console.debug("Token expires in", expIn, "do not update yet")
    }
  }

  private createUserInfo$(): Observable<UserInfo | null>{
    return this.oauthService.events.pipe(
      startWith({}),
      map(() => this.oauthService.getIdentityClaims()),
      distinctUntilChanged(),
      map(claims => claims ? new UserInfo(claims): null),
    );
  }

  private createIsLoggedIn$(): Observable<boolean> {
    return this.oauthService.events.pipe(
      startWith({}),
      map(() => this.isCurrentlyLoggedIn()),
      distinctUntilChanged()
    );
  }

  isCurrentlyLoggedIn(): boolean {
    return !!this.oauthService.hasValidAccessToken();
  }

  login(route?: string){
    this.loginAlreadyStarted = true;
    console.debug('Start login');
    this.oauthService.initLoginFlow(route ?? this.router.url);
  }

  logout(){
    this.oauthService.logOut();
    this.navigateToLogoutPage();
  }

  navigateToLogoutPage(){
    this.router.navigateByUrl(afterLogoutURL);
  }
}
