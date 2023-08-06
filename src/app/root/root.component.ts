import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LayoutComponent } from '../core/layout/layout.component';

@Component({
  selector: 'combi-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: `
    <combi-layout>
      <router-outlet></router-outlet>
    </combi-layout>
  `,
})
export class RootComponent {}
