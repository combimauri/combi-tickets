import { Component, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { CombiRecord } from '../../core/models/record.model';
import { LoadingState } from '../../core/states/loading.state';
import { CredentialComponent } from '../../shared/credential/credential.component';
import { RecordDetailsComponent } from '../record-details/record-details.component';

@Component({
  selector: 'combi-send-form',
  standalone: true,
  imports: [
    CredentialComponent,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h1 mat-dialog-title> Send email to {{ record.name }} </h1>

    <div mat-dialog-content>
      <combi-credential
        #credential
        class="hidden"
        [record]="record"
        (credentialLoaded)="buildMessage()"
        (saveInCloud)="buildMessage($event)"
      ></combi-credential>

      <form
        action="https://script.google.com/macros/s/AKfycbz-cMhvR8YntGD1emNLWF-RkZli_mqalhYYE-IklJQRaVi0fJYdHnfmZu0QnCaTf5uzwg/exec"
        class="send-form"
        method="post"
        target="_blank"
      >
        <input class="hidden" name="remitente" type="text" [value]="name" />

        <input
          matInput
          class="hidden"
          name="formGoogleSendEmail"
          type="email"
          [value]="record.email"
        />

        <input
          class="hidden"
          name="email"
          type="email"
          [value]="record.email"
        />

        <input class="hidden" name="nombre" type="text" [value]="record.name" />

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

          <button mat-raised-button color="primary" class="btn" type="submit">
            Send
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .send-form {
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
export class SendFormComponent {
  name = 'GDG Cochabamba';
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
      this.message = `Hola ${this.record.name}, tu credencial para el evento "DevFest Cochabamba 2023" es: ${credentialUrl} ¡Nos vemos ahí!`;
      return;
    }

    if (this.record.credentialUrl) {
      this.message = `Hola ${this.record.name}, tu credencial para el evento "DevFest Cochabamba 2023" es: ${this.record.credentialUrl} ¡Nos vemos ahí!`;
    } else {
      this.credential?.saveInStorage();
    }
  }
}
