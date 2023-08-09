import { Injectable, inject } from '@angular/core';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
} from '@angular/fire/firestore';
import { Observable, catchError, of, tap } from 'rxjs';

import { LoggerService } from './logger.service';
import { Record } from '../models/record.model';
import { LoadingState } from '../states/loading.state';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private loadingState = inject(LoadingState);
  private firestore = inject(Firestore);
  private recordsCollection = collection(this.firestore, 'records');

  private logger = inject(LoggerService);

  getRecords(): Observable<Record[]> {
    this.loadingState.startLoading();

    return (
      collectionData(this.recordsCollection) as Observable<Record[]>
    ).pipe(
      catchError((error) => {
        this.logger.handleError(error);

        return [];
      }),
      tap(() => this.loadingState.stopLoading()),
    );
  }

  getRecord(email: string): Observable<Record | undefined> {
    this.loadingState.startLoading();

    let docRef: DocumentReference<DocumentData>;

    try {
      docRef = doc(this.firestore, 'records', email);
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
