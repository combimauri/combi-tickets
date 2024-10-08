import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, catchError, finalize, of, tap } from 'rxjs';

import { LoggerService } from './logger.service';
import { Registry } from '../models/registry.model';
import { LoadingState } from '../states/loading.state';

@Injectable({ providedIn: 'root' })
export class RegistryService {
  private loadingState = inject(LoadingState);
  private db = inject(Firestore);
  private logger = inject(LoggerService);

  getRegistries(): Observable<Registry[] | undefined> {
    this.loadingState.startLoading();

    const dbQuery = query(
      collection(this.db, 'registries'),
      where('deleted', '==', false),
      orderBy('order'),
    );

    return (collectionData(dbQuery) as Observable<Registry[]>).pipe(
      catchError((error) => this.handleErrorGettingRegistry(error)),
      tap(() => this.loadingState.stopLoading()),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  private handleErrorGettingRegistry(error: string): Observable<undefined> {
    this.loadingState.stopLoading();
    this.logger.handleError(error);

    return of(undefined);
  }
}
