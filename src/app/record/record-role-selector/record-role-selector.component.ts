import { NgFor, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { RecordRole } from '../../core/models/record.model';
import { TranslateRolePipe } from '../../shared/credential/translate-role.pipe';

@Component({
  selector: 'combi-record-role-selector',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    TranslateRolePipe,
    TitleCasePipe,
  ],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Role</mat-label>
      <mat-select
        [(value)]="selectedRole"
        (valueChange)="selectRole.emit(selectedRole)"
      >
        <mat-option value=""> All </mat-option>
        <mat-option *ngFor="let role of ROLES" [value]="role">
          {{ role | translateRole | titlecase }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
})
export class RecordRoleSelectorComponent {
  readonly ROLES = [
    RecordRole.PARTICIPANT,
    RecordRole.KID,
    RecordRole.MENTOR,
    RecordRole.GUIDE,
    RecordRole.ORGANIZER,
  ];

  @Output() selectRole = new EventEmitter<RecordRole | string>();

  selectedRole: RecordRole | string = '';
}
