import { Routes } from '@angular/router';

import { RecordDetailsComponent } from './record-details/record-details.component';
import { RecordListComponent } from './record-list/record-list.component';

export const recordRoutes: Routes = [
  {
    path: '',
    component: RecordListComponent,
  },
  {
    path: ':recordId',
    component: RecordDetailsComponent,
  },
];
