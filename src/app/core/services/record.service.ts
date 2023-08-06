import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Record } from '../models/record.model';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private firestore = inject(Firestore);
  private recordsCollection = collection(this.firestore, 'records');

  getRecords(): Observable<Record[]> {
    return collectionData(this.recordsCollection) as Observable<Record[]>;
  }
}
