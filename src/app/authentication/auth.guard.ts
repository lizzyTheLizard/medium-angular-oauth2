import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService) {}

  canActivate(route: ActivatedRouteSnapshot) {
    //Check if the user is logged in
    if (this.authenticationService.isCurentlyLoggedIn()) {
      return true;
    } else {
      const newUrl = route.url.toString();
      this.authenticationService.loginOnRoute(newUrl);
      return false;
    }
  }
}