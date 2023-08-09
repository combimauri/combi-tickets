import { Injectable, inject } from '@angular/core';
import {
  DocumentData,
  DocumentReference,
  Firestore,
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
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, of, tap } from 'rxjs';

import { LoggerService } from './logger.service';
import { Record } from '../models/record.model';
import { LoadingState } from '../states/loading.state';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private loadingState = inject(LoadingState);
  private db = inject(Firestore);
  private logger = inject(LoggerService);

  getAllRecords(): Observable<Record[]> {
    this.loadingState.startLoading();

    return (
      collectionData(collection(this.db, 'records')) as Observable<Record[]>
    ).pipe(
      catchError((error) => {
        this.logger.handleError(error);

        return [];
      }),
      tap(() => this.loadingState.stopLoading()),
    );
  }

  getRecordsCount(): Observable<number> {
    return from(getCountFromServer(collection(this.db, 'records'))).pipe(
      map((snapshot) => snapshot.data().count),
    );
  }

  getFirstPageOfRecords(pageSize: number): Observable<Record[]> {
    this.loadingState.startLoading();

    return (
      collectionData(
        query(collection(this.db, 'records'), orderBy('name'), limit(pageSize)),
      ) as Observable<Record[]>
    ).pipe(tap(() => this.loadingState.stopLoading()));
  }

  getNextPageOfRecords(
    lastVisibleRecord: Record,
    pageSize: number,
  ): Observable<Record[]> {
    this.loadingState.startLoading();

    return (
      collectionData(
        query(
          collection(this.db, 'records'),
          orderBy('name'),
          startAfter(lastVisibleRecord.name),
          limit(pageSize),
        ),
      ) as Observable<Record[]>
    ).pipe(tap(() => this.loadingState.stopLoading()));
  }

  getPreviousPageOfRecords(
    lastVisibleRecord: Record,
    pageSize: number,
  ): Observable<Record[]> {
    this.loadingState.startLoading();

    return (
      collectionData(
        query(
          collection(this.db, 'records'),
          orderBy('name'),
          endBefore(lastVisibleRecord.name),
          limitToLast(pageSize),
        ),
      ) as Observable<Record[]>
    ).pipe(tap(() => this.loadingState.stopLoading()));
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
    );
  }

  private handleErrorGettingRecord(error: string): Observable<undefined> {
    this.logger.handleError(error);

    return of(undefined);
  }
}
