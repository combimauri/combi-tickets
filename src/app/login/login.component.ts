import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'combi-login',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-content>Simple card</mat-card-content>
    </mat-card>
  `,
  styles: [],
})
export class LoginComponent {}
