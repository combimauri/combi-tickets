import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAnalytics(() => getAnalytics()),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
    ),
  ],
};
