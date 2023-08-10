import { Injectable, inject } from '@angular/core';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  Query,
  collection,
  collectionData,
  doc,
  docData,
  endBefore,
  getCountFromServer,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  where,
} from '@angular/fire/firestore';
import {
  Observable,
  catchError,
  finalize,
  from,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { LoggerService } from './logger.service';
import { Record, RecordListing } from '../models/record.model';
import { LoadingState } from '../states/loading.state';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private loadingState = inject(LoadingState);
  private db = inject(Firestore);
  private logger = inject(LoggerService);

  getAllRecords(): Observable<Record[] | undefined> {
    this.loadingState.startLoading();

    return (
      collectionData(collection(this.db, 'records')) as Observable<Record[]>
    ).pipe(
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getFirstPageOfRecords(
    pageSize: number,
    searchTerm: string,
  ): Observable<RecordListing | undefined> {
    this.loadingState.startLoading();

    let dbQuery = query(collection(this.db, 'records'));
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);
    dbQuery = query(dbQuery, orderBy('searchTerm'), limit(pageSize));

    return (collectionData(dbQuery) as Observable<Record[]>).pipe(
      switchMap((items) =>
        this.getRecordsCount(searchTerm).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getNextPageOfRecords(
    lastVisibleRecord: Record,
    pageSize: number,
    searchTerm: string,
  ): Observable<RecordListing | undefined> {
    this.loadingState.startLoading();

    let dbQuery = query(collection(this.db, 'records'));
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);
    dbQuery = query(
      dbQuery,
      orderBy('searchTerm'),
      startAfter(lastVisibleRecord.searchTerm),
      limit(pageSize),
    );

    return (collectionData(dbQuery) as Observable<Record[]>).pipe(
      switchMap((items) =>
        this.getRecordsCount(searchTerm).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getPreviousPageOfRecords(
    lastVisibleRecord: Record,
    pageSize: number,
    searchTerm: string,
  ): Observable<RecordListing | undefined> {
    this.loadingState.startLoading();

    let dbQuery = query(collection(this.db, 'records'));
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);
    dbQuery = query(
      dbQuery,
      orderBy('searchTerm'),
      endBefore(lastVisibleRecord.searchTerm),
      limitToLast(pageSize),
    );

    return (collectionData(dbQuery) as Observable<Record[]>).pipe(
      switchMap((items) =>
        this.getRecordsCount(searchTerm).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getRecordByEmail(email: string): Observable<Record | undefined> {
    this.loadingState.startLoading();

    let docRef: DocumentReference<DocumentData>;

    try {
      docRef = doc(this.db, 'records', email);
    } catch (error) {
      this.loadingState.stopLoading();

      return this.handleErrorGettingRecord(error as string);
    }

    return (docData(docRef) as Observable<Record>).pipe(
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  private addSearchTermToQuery(
    dbQuery: Query<DocumentData>,
    searchTerm: string,
  ): Query<DocumentData> {
    if (!searchTerm) {
      return dbQuery;
    }

    return query(
      dbQuery,
      where('searchTerm', '>=', searchTerm),
      where('searchTerm', '<=', searchTerm + '\uf8ff'),
    );
  }

  private getRecordsCount(searchTerm: string): Observable<number> {
    let dbQuery = query(collection(this.db, 'records'));
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);

    return from(getCountFromServer(dbQuery)).pipe(
      map((snapshot) => snapshot.data().count),
    );
  }

  private handleErrorGettingRecord(error: string): Observable<undefined> {
    this.logger.handleError(error);

    return of(undefined);
  }
}
