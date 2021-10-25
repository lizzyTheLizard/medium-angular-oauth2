import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PrivateGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot){
    //Check if the user is logged in
    if (this.auth.isCurrentlyLoggedIn()) {
      return true;
    }
    const newUrl = route.url.toString();
    this.auth.login(newUrl);
    return false;
  }
}
