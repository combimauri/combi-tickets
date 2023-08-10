import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

import { RecordService } from '../core/services/record.service';
import { CredentialComponent } from '../shared/credential/credential.component';

@Component({
  selector: 'combi-credentials',
  standalone: true,
  imports: [AsyncPipe, CredentialComponent, NgFor, NgIf],
  template: `
    <div *ngIf="records$ | async as records" class="credentials">
      <combi-credential
        *ngFor="let record of records"
        [record]="record"
      ></combi-credential>
    </div>
  `,
  styles: [
    `
      .credentials {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
      }
    `,
  ],
})
export class CredentialsComponent {
  private recordService = inject(RecordService);
  records$ = this.recordService.getAllRecords();
}
