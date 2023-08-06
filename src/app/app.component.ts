import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { LayoutComponent } from './core/layout/layout.component';

@Component({
  selector: 'combi-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LayoutComponent],
  template: `
    <combi-layout>
      <router-outlet></router-outlet>
    </combi-layout>
  `,
  styles: [],
})
export class AppComponent {}
