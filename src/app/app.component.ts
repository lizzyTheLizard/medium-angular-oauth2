import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'medium-angular-oauth2';
  loginFinished = false;
  readonly isLoggedIn$: Observable<boolean>;
  readonly loginFinished$: Observable<boolean>

  constructor(private readonly authenticationService: AuthenticationService) {
    this.isLoggedIn$ = this.authenticationService.isLoggedIn$;
    this.loginFinished$ = this.authenticationService.loginFinished$;
  }  

  login(){
    this.authenticationService.login();
  }

  logout(){
    this.authenticationService.logout();
  }  
}
