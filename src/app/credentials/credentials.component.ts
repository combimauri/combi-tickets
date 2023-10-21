import { Component, QueryList, ViewChildren, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { jsPDF } from 'jspdf';

import { RecordService } from '../core/services/record.service';
import { CredentialComponent } from '../shared/credential/credential.component';

interface CredentialPositionData {
  leftPosition: number;
  topPosition: number;
}

@Component({
  selector: 'combi-credentials',
  standalone: true,
  imports: [AsyncPipe, CredentialComponent, MatButtonModule, NgFor, NgIf],
  template: `
    <div class="header">
      <h1> Credentials </h1>

      <button
        *ngIf="records$ | async"
        mat-raised-button
        (click)="printCredentials()"
      >
        Download
      </button>
    </div>
    <div *ngIf="records$ | async as records" class="credentials">
      <combi-credential
        *ngFor="let record of records"
        #credentials
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
  @ViewChildren('credentials') private credentials:
    | QueryList<CredentialComponent>
    | undefined;

  private recordService = inject(RecordService);
  records$ = this.recordService.getAllRecords();

  private readonly HEIGHT = 10.96;
  private readonly WIDTH = 8;
  private readonly EXTRA_WIDTH = 8.06;
  private readonly JPEG = 'JPEG';
  private readonly CREDENTIALS_POSITION_DATA: Record<
    number,
    CredentialPositionData
  > = {
    1: {
      leftPosition: 0,
      topPosition: 0,
    },
    2: {
      leftPosition: this.EXTRA_WIDTH,
      topPosition: 0,
    },
    3: {
      leftPosition: 0,
      topPosition: this.HEIGHT,
    },
    4: {
      leftPosition: this.EXTRA_WIDTH,
      topPosition: this.HEIGHT,
    },
    5: {
      leftPosition: 0,
      topPosition: this.HEIGHT * 2,
    },
    6: {
      leftPosition: this.EXTRA_WIDTH,
      topPosition: this.HEIGHT * 2,
    },
  };

  printCredentials(): void {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'cm',
      format: [21.5, 32.9],
    });
    const quantityOfCredentials = this.credentials?.length;
    let drawCounter = 0;
    let counter = 0;

    this.credentials?.forEach((credential) => {
      counter++;
      drawCounter++;

      const credentialData =
        credential.credentialCanvas?.nativeElement.toDataURL('image/jpg', 1.0);
      const { leftPosition, topPosition } =
        this.CREDENTIALS_POSITION_DATA[counter];

      pdf.addImage(
        credentialData,
        this.JPEG,
        leftPosition,
        topPosition,
        this.WIDTH,
        this.HEIGHT,
      );

      if (counter === 6) {
        if (quantityOfCredentials !== drawCounter) {
          pdf.addPage();
        }

        counter = 0;
      }
    });

    pdf.save('wgj-credentials.pdf');
  }
}
