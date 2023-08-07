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
import { Observable, catchError, of } from 'rxjs';

import { LoggerService } from './logger.service';
import { Record } from '../models/record.model';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private firestore = inject(Firestore);
  private recordsCollection = collection(this.firestore, 'records');

  private logger = inject(LoggerService);

  getRecords(): Observable<Record[]> {
    return (
      collectionData(this.recordsCollection) as Observable<Record[]>
    ).pipe(
      catchError((error) => {
        this.logger.handleError(error);

        return [];
      }),
    );
  }

  getRecord(email: string): Observable<Record | undefined> {
    let docRef: DocumentReference<DocumentData>;

    try {
      docRef = doc(this.firestore, 'records', email);
    } catch (error) {
      return this.handleErrorGettingRecord(error as string);
    }

    return (docData(docRef) as Observable<Record>).pipe(
      catchError((error) => this.handleErrorGettingRecord(error)),
    );
  }

  private handleErrorGettingRecord(error: string): Observable<undefined> {
    this.logger.handleError(error);

    return of(undefined);
  }
}
