import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Carta } from '../modelos/carta';

/**
 * Ruta del archivo de textos, servido desde src/assets (ver angular.json).
 * Se escribe sin "/" inicial para que respete el <base href> y funcione
 * tanto en local como en GitHub Pages.
 */
const RUTA_CARTAS = 'assets/cartas.json';
/**
 * Se encarga de todo lo relacionado con las cartas:
 * leerlas del JSON y mezclarlas en un orden aleatorio.
 */
@Injectable({ providedIn: 'root' })
export class BarajaService {
  private readonly http = inject(HttpClient);

  /** Lee las 54 cartas desde el JSON de textos. */
  cargarCartas(): Observable<Carta[]> {
    return this.http.get<Carta[]>(RUTA_CARTAS);
  }

  /**
   * Devuelve una copia de la baraja en orden aleatorio.
   * Usa el algoritmo Fisher-Yates: recorre el mazo de atrás hacia
   * adelante intercambiendo cada carta con una posición anterior al azar.
   */
  barajar(cartas: Carta[]): Carta[] {
    const orden = [...cartas];
    for (let i = orden.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [orden[i], orden[j]] = [orden[j], orden[i]];
    }
    return orden;
  }
}
