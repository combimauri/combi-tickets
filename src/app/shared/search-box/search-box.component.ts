import { AsyncPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, tap } from 'rxjs';

@Component({
  selector: 'combi-search-box',
  standalone: true,
  imports: [AsyncPipe, MatInputModule, NgIf, ReactiveFormsModule],
  template: `
    <ng-container *ngIf="search$ | async"></ng-container>
    <form [formGroup]="searchBoxForm">
      <mat-form-field appearance="outline">
        <mat-label>Search</mat-label>
        <input matInput type="search" formControlName="term" />
      </mat-form-field>
    </form>
  `,
  styles: [
    `
      .mat-mdc-form-field {
        width: 300px;
      }
    `,
  ],
})
export class SearchBoxComponent {
  searchBoxForm = inject(FormBuilder).group({
    term: [''],
  });
  search$ = this.searchBoxForm.get('term')?.valueChanges.pipe(
    debounceTime(500),
    tap((term) => this.search.emit(term ?? '')),
  );

  @Output() private search = new EventEmitter<string>();
}
