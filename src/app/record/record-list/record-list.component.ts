import { TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { map } from 'rxjs';

import { Position } from '../../core/models/position.model';
import { Record } from '../../core/models/record.model';
import { RecordService } from '../../core/services/record.service';

@Component({
  selector: 'combi-record-list',
  standalone: true,
  imports: [MatTableModule, TitleCasePipe],
  template: `
    <table mat-table [dataSource]="records$" class="mat-elevation-z1">
      <ng-container matColumnDef="position">
        <th mat-header-cell *matHeaderCellDef> No. </th>
        <td mat-cell *matCellDef="let element"> {{ element.position }} </td>
      </ng-container>

      <ng-container matColumnDef="details">
        <th mat-header-cell *matHeaderCellDef> Details </th>
        <td mat-cell *matCellDef="let element">
          {{ element.name }}
          <small>
            {{ element.email }}
          </small>
        </td>
      </ng-container>

      <ng-container matColumnDef="type">
        <th mat-header-cell *matHeaderCellDef> Type </th>
        <td mat-cell *matCellDef="let element">
          {{ element.type | titlecase }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="COLUMNS"></tr>
      <tr mat-row *matRowDef="let row; columns: COLUMNS"></tr>
    </table>
  `,
  styles: [
    `
      .mat-column-details small {
        display: block;
      }
    `,
  ],
})
export class RecordListComponent {
  readonly COLUMNS = ['position', 'details', 'type'];

  private recordService = inject(RecordService);
  records$ = this.recordService
    .getRecords()
    .pipe(
      map((records) =>
        records.map(
          (record, index) =>
            ({ ...record, position: index + 1 }) as Record & Position,
        ),
      ),
    );
}
