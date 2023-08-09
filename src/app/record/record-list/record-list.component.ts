import { AsyncPipe, NgIf, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subject, map, switchMap } from 'rxjs';

import { Position } from '../../core/models/position.model';
import { PageRecords } from '../../core/models/page-records.model';
import { Record } from '../../core/models/record.model';
import { RecordService } from '../../core/services/record.service';

@Component({
  selector: 'combi-record-list',
  standalone: true,
  imports: [AsyncPipe, MatPaginatorModule, MatTableModule, NgIf, TitleCasePipe],
  template: `
    <ng-container *ngIf="records$ | async as records">
      <table mat-table [dataSource]="records" class="mat-elevation-z1">
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

      <mat-paginator
        aria-label="Select page"
        [length]="collectionLength$ | async"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50, 100]"
        (page)="
          handlePaginationChange(
            $event,
            records[0],
            records[records.length - 1]
          )
        "
      >
      </mat-paginator>
    </ng-container>
  `,
  styles: [
    `
      .mat-column-details small {
        display: block;
      }
    `,
  ],
})
export class RecordListComponent implements AfterViewInit {
  pageSize = 20;
  private pageIndex = 0;

  readonly COLUMNS = ['position', 'details', 'type'];

  private recordService = inject(RecordService);
  private recordsSubject$ = new Subject<PageRecords>();
  records$ = this.recordsSubject$.pipe(
    switchMap((pageRecords) => this.loadRecords(pageRecords)),
    map((records) => this.mapRecordsPosition(records)),
  );
  collectionLength$ = this.recordService.getRecordsCount();

  ngAfterViewInit(): void {
    this.recordsSubject$.next({});
  }

  handlePaginationChange(
    { pageIndex, pageSize, previousPageIndex }: PageEvent,
    firstRecord: Record,
    lastRecord: Record,
  ): void {
    const previousPageSize = this.pageSize;
    this.pageSize = pageSize;
    this.pageIndex = pageIndex;
    previousPageIndex = previousPageIndex ?? 0;

    if (pageIndex === previousPageIndex || pageSize !== previousPageSize) {
      this.recordsSubject$.next({});
    } else if (pageIndex > previousPageIndex) {
      this.recordsSubject$.next({ lastRecord });
    } else {
      this.recordsSubject$.next({ firstRecord });
    }
  }

  private loadRecords({
    firstRecord,
    lastRecord,
  }: PageRecords): Observable<Record[]> {
    if (lastRecord) {
      return this.recordService.getNextPageOfRecords(lastRecord, this.pageSize);
    } else if (firstRecord) {
      return this.recordService.getPreviousPageOfRecords(
        firstRecord,
        this.pageSize,
      );
    }

    return this.recordService.getFirstPageOfRecords(this.pageSize);
  }

  private mapRecordsPosition(records: Record[]): (Record & Position)[] {
    return records.map(
      (record, index) =>
        ({
          ...record,
          position: this.pageIndex * this.pageSize + index + 1,
        }) as Record & Position,
    );
  }
}
