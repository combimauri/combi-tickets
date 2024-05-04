import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Registry } from '../../core/models/registry.model';

@Component({
  selector: 'combi-scanner-registry-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, NgFor, NgIf],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Select Registry</mat-label>
      <mat-select
        [(value)]="selectedRegistry"
        (valueChange)="selectRegistry.emit(selectedRegistry)"
      >
        <mat-option style="font-style: italic;" [value]="undefined">
          None
        </mat-option>
        <ng-container *ngIf="registries">
          <mat-option
            *ngFor="let registry of registries; index as i"
            [value]="registry"
          >
            {{ registry.label }}
          </mat-option>
        </ng-container>
      </mat-select>
    </mat-form-field>
  `,
})
export class ScannerRegistrySelectorComponent {
  @Input() registries?: Registry[] | null;

  @Output() selectRegistry = new EventEmitter<Registry | undefined>();

  selectedRegistry?: Registry;
}
