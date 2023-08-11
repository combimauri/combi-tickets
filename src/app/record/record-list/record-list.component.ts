import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, NgIf, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subject, map, shareReplay, switchMap } from 'rxjs';

import { RecordDetailsComponent } from '../record-details/record-details.component';
import { RecordRoleSelectorComponent } from '../record-role-selector/record-role-selector.component';
import { Position } from '../../core/models/position.model';
import { PageRecords } from '../../core/models/page-records.model';
import {
  CombiRecord,
  RecordListing,
  RecordRole,
} from '../../core/models/record.model';
import { RecordService } from '../../core/services/record.service';
import { TranslateRolePipe } from '../../shared/credential/translate-role.pipe';
import { SearchBoxComponent } from '../../shared/search-box/search-box.component';

@Component({
  selector: 'combi-record-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatDialogModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    NgIf,
    RecordRoleSelectorComponent,
    SearchBoxComponent,
    TitleCasePipe,
    TranslateRolePipe,
  ],
  template: `
    <div class="header">
      <h1> Records </h1>

      <div class="filters__container dense">
        <combi-record-role-selector
          (selectRole)="filterByRole($event)"
        ></combi-record-role-selector>

        <combi-search-box (search)="searchRecord($event)"></combi-search-box>
      </div>
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
          <small *ngIf="isHandset$ | async">
            {{ element.role | translateRole | titlecase }}
          </small>
        </td>
      </ng-container>

      <ng-container matColumnDef="role">
        <th mat-header-cell *matHeaderCellDef> Role </th>
        <td mat-cell *matCellDef="let element">
          {{ element.role | translateRole | titlecase }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns$ | async"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: columns$ | async"
        (click)="openRecordDetails(row)"
      ></tr>
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
      .filters__container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
      }

      .mat-column-details small {
        display: block;
      }

      .mat-mdc-row .mat-mdc-cell {
        cursor: pointer;
      }

      .mat-mdc-row:hover {
        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      }
    `,
  ],
})
export class RecordListComponent implements AfterViewInit {
  pageSize = 15;
  total = 0;
  pageIndex = 0;

  private searchTerm = '';
  private selectedRole: RecordRole | string = '';

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay(),
  );
  columns$ = this.isHandset$.pipe(
    map((isHandset) =>
      isHandset ? ['position', 'details'] : ['position', 'details', 'role'],
    ),
  );

  private recordService = inject(RecordService);
  private recordsSubject$ = new Subject<PageRecords>();
  records$ = this.recordsSubject$.pipe(
    switchMap((pageRecords) => this.loadRecords(pageRecords)),
    map((records) => this.mapRecordsPosition(records)),
  );

  private dialog = inject(MatDialog);

  ngAfterViewInit(): void {
    this.recordsSubject$.next({});
  }

  openRecordDetails(data: CombiRecord): void {
    this.dialog.open(RecordDetailsComponent, { data });
  }

  filterByRole(role: RecordRole | string): void {
    this.selectedRole = role;

    this.resetTable();
  }

  searchRecord(term: string | Event): void {
    if (typeof term !== 'string') {
      return;
    }

    this.searchTerm = term.replace(/\s/g, '').toLowerCase();

    this.resetTable();
  }

  handlePaginationChange(
    { pageIndex, pageSize, previousPageIndex }: PageEvent,
    firstRecord: CombiRecord,
    lastRecord: CombiRecord,
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

  private resetTable(): void {
    this.pageIndex = 0;

    this.recordsSubject$.next({});
  }

  private loadRecords({
    firstRecord,
    lastRecord,
  }: PageRecords): Observable<CombiRecord[]> {
    if (lastRecord) {
      return this.recordService
        .getNextPageOfRecords(
          lastRecord,
          this.pageSize,
          this.selectedRole,
          this.searchTerm,
        )
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    } else if (firstRecord) {
      return this.recordService
        .getPreviousPageOfRecords(
          firstRecord,
          this.pageSize,
          this.selectedRole,
          this.searchTerm,
        )
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    }

    return this.recordService
      .getFirstPageOfRecords(this.pageSize, this.selectedRole, this.searchTerm)
      .pipe(map((listing) => this.handleLoadRecordListing(listing)));
  }

  private handleLoadRecordListing(listing: RecordListing | undefined) {
    this.total = listing?.total ?? 0;

    return listing?.items ? [...listing.items] : [];
  }

  private mapRecordsPosition(
    records: CombiRecord[],
  ): (CombiRecord & Position)[] {
    return records.map(
      (record, index) =>
        ({
          ...record,
          position: this.pageIndex * this.pageSize + index + 1,
        }) as CombiRecord & Position,
    );
  }
}
