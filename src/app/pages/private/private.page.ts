import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.css']
})
export class PrivatePage {

  constructor(readonly authService: AuthService) { }
}
