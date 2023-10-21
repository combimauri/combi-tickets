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
  updateDoc,
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
  take,
  tap,
} from 'rxjs';

import { LoggerService } from './logger.service';
import { CombiRecord, RecordListing, RecordRole } from '../models/record.model';
import { LoadingState } from '../states/loading.state';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private loadingState = inject(LoadingState);
  private db = inject(Firestore);
  private logger = inject(LoggerService);

  private readonly COLLECTION_NAME = 'records-mt';

  getAllRecords(): Observable<CombiRecord[] | undefined> {
    this.loadingState.startLoading();

    return (
      collectionData(
        query(
          collection(this.db, this.COLLECTION_NAME),
          orderBy('role'),
          orderBy('searchTerm'),
        ),
      ) as Observable<CombiRecord[]>
    ).pipe(
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getFirstPageOfRecords(
    pageSize: number,
    roleFilter: RecordRole | string,
    searchTerm: string,
  ): Observable<RecordListing | undefined> {
    this.loadingState.startLoading();

    let dbQuery = query(collection(this.db, this.COLLECTION_NAME));
    dbQuery = this.addRoleFilterToQuery(dbQuery, roleFilter);
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);
    dbQuery = query(dbQuery, orderBy('searchTerm'), limit(pageSize));

    return (collectionData(dbQuery) as Observable<CombiRecord[]>).pipe(
      switchMap((items) =>
        this.getRecordsCount(roleFilter, searchTerm).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getNextPageOfRecords(
    lastVisibleRecord: CombiRecord,
    pageSize: number,
    roleFilter: RecordRole | string,
    searchTerm: string,
  ): Observable<RecordListing | undefined> {
    this.loadingState.startLoading();

    let dbQuery = query(collection(this.db, this.COLLECTION_NAME));
    dbQuery = this.addRoleFilterToQuery(dbQuery, roleFilter);
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);
    dbQuery = query(
      dbQuery,
      orderBy('searchTerm'),
      startAfter(lastVisibleRecord.searchTerm),
      limit(pageSize),
    );

    return (collectionData(dbQuery) as Observable<CombiRecord[]>).pipe(
      switchMap((items) =>
        this.getRecordsCount(roleFilter, searchTerm).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getPreviousPageOfRecords(
    lastVisibleRecord: CombiRecord,
    pageSize: number,
    roleFilter: RecordRole | string,
    searchTerm: string,
  ): Observable<RecordListing | undefined> {
    this.loadingState.startLoading();

    let dbQuery = query(collection(this.db, this.COLLECTION_NAME));
    dbQuery = this.addRoleFilterToQuery(dbQuery, roleFilter);
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);
    dbQuery = query(
      dbQuery,
      orderBy('searchTerm'),
      endBefore(lastVisibleRecord.searchTerm),
      limitToLast(pageSize),
    );

    return (collectionData(dbQuery) as Observable<CombiRecord[]>).pipe(
      switchMap((items) =>
        this.getRecordsCount(roleFilter, searchTerm).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  getRecordByEmail(email: string): Observable<CombiRecord | undefined> {
    this.loadingState.startLoading();

    let docRef: DocumentReference<DocumentData>;

    try {
      docRef = doc(this.db, this.COLLECTION_NAME, email);
    } catch (error) {
      return this.handleErrorGettingRecord(error as string);
    }

    return (docData(docRef) as Observable<CombiRecord>).pipe(
      take(1),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  updateRecord(
    email: string,
    data: Partial<CombiRecord>,
  ): Observable<Partial<CombiRecord> | undefined> {
    this.loadingState.startLoading();

    let docRef: DocumentReference<DocumentData>;

    try {
      docRef = doc(this.db, this.COLLECTION_NAME, email);
    } catch (error) {
      return this.handleErrorGettingRecord(error as string);
    }

    return from(updateDoc(docRef, { ...data })).pipe(
      map(() => {
        this.logger.handleSuccess('Record updated successfully.');

        return { ...data, email };
      }),
      catchError((error) => this.handleErrorGettingRecord(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  private addRoleFilterToQuery(
    dbQuery: Query<DocumentData>,
    roleFilter: RecordRole | string,
  ): Query<DocumentData> {
    if (!roleFilter) {
      return dbQuery;
    }

    return query(dbQuery, where('role', '==', roleFilter));
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

  private getRecordsCount(
    roleFilter: RecordRole | string,
    searchTerm: string,
  ): Observable<number> {
    let dbQuery = query(collection(this.db, this.COLLECTION_NAME));
    dbQuery = this.addRoleFilterToQuery(dbQuery, roleFilter);
    dbQuery = this.addSearchTermToQuery(dbQuery, searchTerm);

    return from(getCountFromServer(dbQuery)).pipe(
      map((snapshot) => snapshot.data().count),
    );
  }

  private handleErrorGettingRecord(error: string): Observable<undefined> {
    this.loadingState.stopLoading();
    this.logger.handleError(error);

    return of(undefined);
  }
}
