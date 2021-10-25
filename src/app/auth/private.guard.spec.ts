import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';
import { PrivateGuard } from './private.guard';

describe('PrivateGuard', () => {
  const authService = {} as AuthService;
  const urlSegments = {} as UrlSegment[];
  const route = { url: urlSegments } as ActivatedRouteSnapshot;

  it('should be created', () => {
    const guard = new PrivateGuard(authService);
    expect(guard).toBeTruthy();
  });

  it('if logged in true', () => {
    authService.isCurrentlyLoggedIn = jasmine.createSpy().and.returnValue(true);
    const guard = new PrivateGuard(authService);
    expect(guard.canActivate(route)).toBeTrue();
  });

  it('otherwise start a login', () => {
    authService.isCurrentlyLoggedIn = jasmine.createSpy().and.returnValue(false);
    authService.login = jasmine.createSpy("login");
    urlSegments.toString = jasmine.createSpy("toString").and.returnValue("route");
    const guard = new PrivateGuard(authService);
    expect(guard.canActivate(route)).toBeFalse();
    expect(authService.login).toHaveBeenCalled();
  });
});
