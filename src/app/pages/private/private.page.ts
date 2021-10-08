import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.css']
})
export class PrivatePage {
  readonly userInfo$: Observable<object>;

  constructor(private readonly oauthService: OAuthService, private readonly httpClient: HttpClient) { 
    this.userInfo$ = this.oauthService.events.pipe(
        map(e => this.oauthService.getIdentityClaims()),
        startWith(this.oauthService.getIdentityClaims())
    );
  }

  makeAuthenticatedRequest(){
    this.httpClient.get<object>("http://localhost:3000/info").subscribe(r => {
      const message = "Response from backend is " + JSON.stringify(r);
      alert(message);
    });
  }
}
