import { Component, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { CombiRecord } from '../../../core/models/record.model';
import { LoadingState } from '../../../core/states/loading.state';
import { CredentialComponent } from '../../../shared/credential/credential.component';
import { RecordDetailsComponent } from '../../record-details/record-details.component';

@Component({
  selector: 'combi-wa-send-form',
  standalone: true,
  imports: [
    CredentialComponent,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h1 mat-dialog-title> Send WhatsApp to {{ record.name }} </h1>

    <div mat-dialog-content class="send__content">
      <combi-credential
        #credential
        class="hidden"
        [record]="record"
        (credentialLoaded)="buildMessage()"
        (saveInCloud)="buildMessage($event)"
      ></combi-credential>

      <mat-form-field>
        <mat-label>Message</mat-label>
        <textarea
          matInput
          name="mensaje"
          type="text"
          rows="5"
          [value]="message"
          [disabled]="!message"
        >
        </textarea>
      </mat-form-field>

      <div class="actions-container">
        <button mat-button cdkFocusInitial type="button" (click)="close()">
          Close
        </button>

        <button
          mat-raised-button
          color="primary"
          class="btn"
          type="button"
          (click)="sendMessage()"
        >
          Send
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .send__content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .actions-container {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }

      .hidden {
        display: none;
      }
    `,
  ],
})
export class WASendFormComponent {
  name = 'Women Techmakers Cochabamba';
  message = '';

  loading = inject(LoadingState).loading;
  record: CombiRecord = inject(MAT_DIALOG_DATA);

  @ViewChild('credential') credential?: CredentialComponent;

  private dialogRef = inject(MatDialogRef<RecordDetailsComponent>);

  close(): void {
    this.dialogRef.close();
  }

  buildMessage(credentialUrl?: string): void {
    if (!this.record) {
      return;
    }

    if (credentialUrl) {
      this.message = `Hola ${this.record.name}, tu credencial para el evento "Junt@s en Comunidad" es: ${credentialUrl} ¡Nos vemos ahí!`;
      return;
    }

    if (this.record.credentialUrl) {
      this.message = `Hola ${this.record.name}, tu credencial para el evento "Junt@s en Comunidad" es: ${this.record.credentialUrl} ¡Nos vemos ahí!`;
    } else {
      this.credential?.saveInStorage();
    }
  }

  sendMessage(): void {
    if (!this.record) {
      return;
    }

    const whatsappLink = `https://api.whatsapp.com/send?phone=591${
      this.record['phone']
    }&text=${encodeURI(this.message)}`;

    window.open(whatsappLink, '_blank');
  }
}
