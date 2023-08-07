import { DestroyRef, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

export const untilDestroyed = () => {
  const destroy$ = new Subject<void>();
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => {
    destroy$.next();
    destroy$.complete();
  });

  return takeUntil(destroy$);
};
