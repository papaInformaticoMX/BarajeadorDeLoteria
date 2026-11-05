import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

/** Configuración global de la aplicación. */
export const appConfig: ApplicationConfig = {
  providers: [
    // Necesario para leer src/assets/cartas.json con HttpClient.
    provideHttpClient(),
  ],
};
