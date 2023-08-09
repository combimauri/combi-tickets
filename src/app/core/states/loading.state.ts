import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingState {
  loading = computed(() => this.loadRequests() > 0);

  private loadRequests = signal(0);

  startLoading(): void {
    this.loadRequests.update((loadRequests) => loadRequests + 1);
  }

  stopLoading(): void {
    if (this.loadRequests() > 0) {
      this.loadRequests.update((loadRequests) => loadRequests - 1);
    }
  }
}
