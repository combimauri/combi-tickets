import { AsyncPipe, NgIf, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subject, map, switchMap } from 'rxjs';

import { Position } from '../../core/models/position.model';
import { PageRecords } from '../../core/models/page-records.model';
import { Record, RecordListing } from '../../core/models/record.model';
import { RecordService } from '../../core/services/record.service';
import { SearchBoxComponent } from '../../shared/search-box/search-box.component';

@Component({
  selector: 'combi-record-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    NgIf,
    SearchBoxComponent,
    TitleCasePipe,
  ],
  template: `
    <div class="header">
      <h1> Records </h1>
      <combi-search-box (search)="searchRecord($event)"></combi-search-box>
    </div>

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

    <mat-paginator
      *ngIf="records$ | async as records"
      aria-label="Select page"
      [length]="total"
      [pageIndex]="pageIndex"
      [pageSize]="pageSize"
      [pageSizeOptions]="[5, 10, 15, 20, 50, 100]"
      (page)="
        handlePaginationChange($event, records[0], records[records.length - 1])
      "
    >
    </mat-paginator>
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
  pageSize = 15;
  total = 0;
  pageIndex = 0;

  private searchTerm = '';

  readonly COLUMNS = ['position', 'details', 'type'];

  private recordService = inject(RecordService);
  private recordsSubject$ = new Subject<PageRecords>();
  records$ = this.recordsSubject$.pipe(
    switchMap((pageRecords) => this.loadRecords(pageRecords)),
    map((records) => this.mapRecordsPosition(records)),
  );

  ngAfterViewInit(): void {
    this.recordsSubject$.next({});
  }

  searchRecord(term: string | Event): void {
    if (typeof term !== 'string') {
      return;
    }

    this.pageIndex = 0;
    this.searchTerm = term.replace(/\s/g, '').toLowerCase();

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
      return this.recordService
        .getNextPageOfRecords(lastRecord, this.pageSize, this.searchTerm)
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    } else if (firstRecord) {
      return this.recordService
        .getPreviousPageOfRecords(firstRecord, this.pageSize, this.searchTerm)
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    }

    return this.recordService
      .getFirstPageOfRecords(this.pageSize, this.searchTerm)
      .pipe(map((listing) => this.handleLoadRecordListing(listing)));
  }

  private handleLoadRecordListing(listing: RecordListing | undefined) {
    this.total = listing?.total ?? 0;

    return listing?.items ? [...listing.items] : [];
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
