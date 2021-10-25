import { EventEmitter } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom, Subject, } from 'rxjs';

import { AuthService } from './auth.service';
import { UserInfo } from './user-info';

describe('AuthService', () => {
  const events = new Subject<OAuthEvent>();
  const onPing = new EventEmitter<any>();
  var router: Router;
  var idle: Idle;
  var keepalive: Keepalive;
  var oAuthService: OAuthService;

  beforeEach(() => {
    oAuthService = jasmine.createSpyObj('oauthService', ['configure', 'loadDiscoveryDocumentAndTryLogin', 
      'getIdentityClaims', 'hasValidAccessToken', 
      'initLoginFlow', 'silentRefresh', 'getAccessTokenExpiration',
      'logOut']);
    router = jasmine.createSpyObj('router', ["navigateByUrl"]);
    idle = jasmine.createSpyObj('idle', ['setIdle','setTimeout','setInterrupts', 'watch']);
    keepalive = jasmine.createSpyObj('keepalive', ['interval']);
    Object.defineProperty(router, 'url', { get: jasmine.createSpy('getUrl').and.returnValue('currentUrl') });
    oAuthService.events = events;
    keepalive.onPing = onPing;
  });

  it('initialization oauth', async () => {
    //Normal initialization
    var service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    expect(oAuthService.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled();
    expect(oAuthService.configure).toHaveBeenCalled();

    //route to error if setup fails
    oAuthService.loadDiscoveryDocumentAndTryLogin = jasmine.createSpy().and.returnValue(Promise.reject('failed'));
    service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('initialization idle', async () => {
    //Normal initialization
    var service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    expect(idle.watch).toHaveBeenCalled();
  });


  it('userInfo ', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);

    //Observe the user info
    oAuthService.getIdentityClaims = jasmine.createSpy().and.returnValue(null);

    var userInfo: UserInfo | null | undefined = undefined;
    var changes = 0;
    service.userInfo$.subscribe(ui => { userInfo = ui; changes++; });

    //There should be an value immediately
    expect(userInfo).toBeNull();
    expect(changes).toEqual(1);

    //Lets update the value
    oAuthService.getIdentityClaims = jasmine.createSpy().and.returnValue({ sub: "test-user" });
    events.next({} as OAuthEvent);
    expect(userInfo).toEqual(jasmine.objectContaining({ sub: "test-user" }));
    expect(changes).toEqual(2);

    //New events do not trigger a new value
    events.next({} as OAuthEvent);
    expect(userInfo).toEqual(jasmine.objectContaining({ sub: "test-user" }));
    expect(changes).toEqual(2);

    //Observe the user info again
    var userInfo2: UserInfo | null | undefined = undefined;
    var changes2 = 0;
    service.userInfo$.subscribe(ui => { userInfo2 = ui; changes2++; });

    //A new observer will only get the new value
    expect(userInfo2).toEqual(jasmine.objectContaining({ sub: "test-user" }));
    expect(changes2).toEqual(1);

    //Lets log out the user again
    oAuthService.getIdentityClaims = jasmine.createSpy().and.returnValue(null);
    events.next({} as OAuthEvent);
    expect(userInfo).toBeNull();
    expect(changes).toEqual(3);

    //New events do not trigger a new value
    events.next({} as OAuthEvent);
    expect(userInfo).toBeNull();
    expect(changes).toEqual(3);
  });

  it('isLoggedIn ', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);

    //Observe the isLoggedIn
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(false);

    var isLoggedIn: boolean | undefined = undefined;
    var changes = 0;
    service.isLoggedIn$.subscribe(ili => { isLoggedIn = ili; changes++; });

    //There should be an value immediately
    expect(isLoggedIn).toBeFalse();
    expect(changes).toEqual(1);

    //Lets update the value
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(true);
    events.next({} as OAuthEvent);
    expect(isLoggedIn).toBeTrue();
    expect(changes).toEqual(2);

    //New events do not trigger a new value
    events.next({} as OAuthEvent);
    expect(isLoggedIn).toBeTrue();
    expect(changes).toEqual(2);

    //Observe the user info again
    var isLoggedIn2: boolean | undefined = undefined;
    var changes2 = 0;
    service.isLoggedIn$.subscribe(ili => { isLoggedIn2 = ili; changes2++; });

    //A new observer will only get the new value
    expect(isLoggedIn2).toBeTrue();
    expect(changes2).toEqual(1);

    //Lets log out the user again
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(false);
    events.next({} as OAuthEvent);
    expect(isLoggedIn).toBeFalse();
    expect(changes).toEqual(3);

    //New events do not trigger a new value
    events.next({} as OAuthEvent);
    expect(isLoggedIn).toBeFalse();
    expect(changes).toEqual(3);
  });

  it('isCurrentlyLoggedIn', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);

    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(false);
    expect(service.isCurrentlyLoggedIn()).toBeFalse();
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(true);
    expect(service.isCurrentlyLoggedIn()).toBeTrue();
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(false);
    expect(service.isCurrentlyLoggedIn()).toBeFalse();
  });

  it('logout', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);

    service.logout();
    expect(oAuthService.logOut).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('navigateToLogoutPage', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);

    service.navigateToLogoutPage();
    expect(oAuthService.logOut).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('login', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);

    //login with current route
    service.login();
    expect(oAuthService.initLoginFlow).toHaveBeenCalledWith('currentUrl');

    //login with given route
    service.login('route');
    expect(oAuthService.initLoginFlow).toHaveBeenCalledWith('route');
  });

  it('redirectAfterLogin', async () => {
    const service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    oAuthService.state = "test-url";
    events.next({ type: "token_received" })
    expect(router.navigateByUrl).toHaveBeenCalledWith('test-url');
  });

  it('autoLogin', async () => {
    //Normally, autologin shall be performed
    var service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    expect(oAuthService.silentRefresh).toHaveBeenCalled();
    (oAuthService.silentRefresh as jasmine.Spy).calls.reset();

    //If already logged in, no silent refresh shall be performed
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(true);
    service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(0);
    (oAuthService.silentRefresh as jasmine.Spy).calls.reset();

    //Login is not started twice
    service = new AuthService(oAuthService, router, idle, keepalive);
    service.login();
    await firstValueFrom(service.setupFinished$);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(0);
  });

  it('silentRefresh on ping', fakeAsync( async () => {
    var service = new AuthService(oAuthService, router, idle, keepalive);
    await firstValueFrom(service.setupFinished$);
    (oAuthService.silentRefresh as jasmine.Spy).calls.reset();

    //If there is no auth token, silent refresh is triggered
    onPing.next({});
    tick(50);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(1);
    (oAuthService.silentRefresh as jasmine.Spy).calls.reset();

    //If access token is invalid, silent refresh is triggered
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(false);
    onPing.next({});
    tick(50);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(1);    
    (oAuthService.silentRefresh as jasmine.Spy).calls.reset();

    //If access token is outdated, silent refresh is triggered
    oAuthService.hasValidAccessToken = jasmine.createSpy().and.returnValue(true);
    oAuthService.getAccessTokenExpiration = jasmine.createSpy().and.returnValue(Date.now()-100);
    onPing.next({});
    tick(50);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(1);
    (oAuthService.silentRefresh as jasmine.Spy).calls.reset();

    //If there is a new access token, no silent refresh is triggered
    oAuthService.getAccessTokenExpiration = jasmine.createSpy().and.returnValue(Date.now()+100000);
    onPing.next({});
    tick(50);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(0);
    
    //If there is a old access token, silent refresh is triggered
    oAuthService.getAccessTokenExpiration = jasmine.createSpy().and.returnValue(Date.now()+100);
    onPing.next({});
    tick(50);
    expect(oAuthService.silentRefresh).toHaveBeenCalledTimes(1);
  }));
});
