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

  private readonly HEIGHT = 455;
  private readonly WIDTH = 280;
  private readonly FIRST_ITEM_LEFT = 15;
  private readonly FIRST_LINE_TOP = 20;
  private readonly JPEG = 'JPEG';
  private readonly SECOND_ITEM_LEFT = 315;
  private readonly SECOND_LINE_TOP = 525;
  private readonly CREDENTIALS_POSITION_DATA: Record<
    number,
    CredentialPositionData
  > = {
    1: {
      leftPosition: this.FIRST_ITEM_LEFT,
      topPosition: this.FIRST_LINE_TOP,
    },
    2: {
      leftPosition: this.SECOND_ITEM_LEFT,
      topPosition: this.FIRST_LINE_TOP,
    },
    3: {
      leftPosition: this.FIRST_ITEM_LEFT,
      topPosition: this.SECOND_LINE_TOP,
    },
    4: {
      leftPosition: this.SECOND_ITEM_LEFT,
      topPosition: this.SECOND_LINE_TOP,
    },
  };

  printCredentials(): void {
    const pdf = new jsPDF('p', 'pt', 'legal');
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

      if (counter === 4) {
        if (quantityOfCredentials !== drawCounter) {
          pdf.addPage();
        }

        counter = 0;
      }
    });

    pdf.save('wgj-credentials.pdf');
  }
}
