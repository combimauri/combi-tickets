import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CombiRecord } from '../models/record.model';

@Injectable({ providedIn: 'root' })
export class LastScanState {
  private readonly lastScan$ = new BehaviorSubject<CombiRecord | null>(null);

  getLastScan(): Observable<CombiRecord | null> {
    return this.lastScan$.asObservable();
  }

  setLastScan(value: CombiRecord): void {
    this.lastScan$.next(value);
  }
}
