import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/authentication/authentication.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.css']
})
export class PrivatePage implements OnInit, OnDestroy {
  private loggedInSubscription: Subscription | undefined;
  readonly userInfo$: Observable<object>;

  constructor(private readonly authenticationService: AuthenticationService, private readonly httpClient: HttpClient) { 
    //Update the user infos with every event and start with the current value
    this.userInfo$ = this.authenticationService.userInfo$;
  }

  ngOnInit(): void {
    this.loggedInSubscription = this.authenticationService.loggedOut$.subscribe(() => this.loggedOut());
  }

  ngOnDestroy(): void {
    if(this.loggedInSubscription) {
      this.loggedInSubscription.unsubscribe();
      this.loggedInSubscription = undefined;
    }
  }

  private loggedOut(){
    //What shall happen if the user session ends while beeing on this page? 
    //Just navigate away can be bad, as the user then can lose potential input etc.
    //Best action depends on the actual use case, here we just ask him...
    if(confirm('You have been logged out. Do you want to try to log in again?')) {
      this.authenticationService.login();
    } else {
      this.authenticationService.navigateToLogoutPage();
    }
  }

  makeAuthenticatedRequest(){
    this.httpClient.get<object>("http://localhost:3000/info").subscribe(r => {
      const message = "Response from backend is " + JSON.stringify(r);
      alert(message);
    });
  }
}
