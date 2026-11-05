import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartaComponent } from './componentes/carta/carta.component';
import { Carta } from './modelos/carta';
import { BarajaService } from './servicios/baraja.service';
import { VozService } from './servicios/voz.service';

/**
 * Componente raíz: dirige la partida.
 * Mantiene el orden barajado de la ronda, muestra la carta que toca
 * y la canta en voz alta con el VozService.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CartaComponent, FormsModule, DecimalPipe],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly baraja = inject(BarajaService);

  /** Expuesto en la plantilla para avisar si el navegador no tiene voz. */
  readonly voz = inject(VozService);

  /** Baraja completa tal como viene del JSON. */
  private cartasBase: Carta[] = [];

  /** Orden aleatorio de la ronda en curso. */
  orden: Carta[] = [];

  /** Posición dentro de `orden` (-1 = aún no se canta ninguna). */
  indice = -1;

  /** true mientras el canto automático está activo. */
  cantando = false;

  /** true cuando ya se cantaron las 54 cartas. */
  rondaTerminada = false;

  /** Mensaje visible si falla la carga del JSON. */
  errorCarga = '';

  // ---- Ajustes que el jugador puede mover en pantalla ----
  /** Si se anuncia "Número 14: La Muerte" o solamente "La Muerte". */
  decirNumero = true;
  /** Velocidad de la voz (1 = normal). */
  velocidadVoz = 1;
  /** Segundos de silencio entre carta y carta. */
  pausaSegundos = 2;

  /** Temporizador del canto automático (para poder cancelarlo). */
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.baraja.cargarCartas().subscribe({
      next: (cartas) => (this.cartasBase = cartas),
      error: () => (this.errorCarga = 'No se pudo leer el archivo assets/cartas.json.'),
    });
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
    this.voz.callar();
  }

  // ---- Lecturas de estado para la plantilla ----

  get cartaActual(): Carta | null {
    return this.indice >= 0 && this.indice < this.orden.length ? this.orden[this.indice] : null;
  }

  /** Cartas que ya se cantaron, en el orden en que salieron. */
  get cantadas(): Carta[] {
    return this.orden.slice(0, this.indice + 1);
  }

  /** Avance de la ronda en porcentaje (0 a 100). */
  get progreso(): number {
    return this.orden.length ? ((this.indice + 1) / this.orden.length) * 100 : 0;
  }

  // ---- Acciones de los botones ----

  /** Prepara una ronda nueva con un orden aleatorio distinto. */
  nuevaRonda(): void {
    this.detener();
    this.orden = this.baraja.barajar(this.cartasBase);
    this.rondaTerminada = false;
  }

  /** Arranca (o reanuda) el canto automático de cartas. */
  comenzar(): void {
    if (!this.orden.length || this.rondaTerminada) {
      return;
    }
    this.cantando = true;
    if (this.indice < 0) {
      this.avanzarYCantar();
    } else {
      this.cantarActual();
    }
  }

  /** Detiene el canto automático y silencia la voz, sin perder el avance. */
  pausar(): void {
    this.cantando = false;
    this.limpiarTemporizador();
    this.voz.callar();
  }

  /** Regresa la ronda al inicio, en silencio. */
  detener(): void {
    this.pausar();
    this.indice = -1;
    this.rondaTerminada = false;
  }

  /** Avanza una carta a mano y la canta una sola vez. */
  siguienteManual(): void {
    if (!this.orden.length || this.rondaTerminada) {
      return;
    }
    this.limpiarTemporizador();
    this.avanzarYCantar();
  }

  // ---- Ajustes desde la plantilla ----

  cambiarVelocidad(evento: Event): void {
    this.velocidadVoz = Number((evento.target as HTMLInputElement).value);
  }

  cambiarPausa(evento: Event): void {
    const segundos = Number((evento.target as HTMLInputElement).value);
    this.pausaSegundos = Math.min(10, Math.max(0, segundos));
  }

  // ---- Mecánica interna del canto ----

  /** Pasa a la siguiente carta del orden y la canta. */
  private avanzarYCantar(): void {
    if (this.indice + 1 >= this.orden.length) {
      this.terminarRonda();
      return;
    }
    this.indice++;
    this.cantarActual();
  }

  /** Canta la carta que está mostrando la pantalla. */
  private cantarActual(): void {
    const carta = this.cartaActual;
    if (!carta) {
      return;
    }
    this.voz.velocidad = this.velocidadVoz;
    this.voz.hablar(this.textoDe(carta), () => this.programarSiguiente());
  }

  /** Agenda la siguiente carta después de la pausa configurada. */
  private programarSiguiente(): void {
    if (!this.cantando) {
      return;
    }
    this.limpiarTemporizador();
    this.temporizador = setTimeout(() => this.avanzarYCantar(), this.pausaSegundos * 1000);
  }

  private terminarRonda(): void {
    this.cantando = false;
    this.rondaTerminada = true;
    this.voz.hablar('Se cantaron las 54 cartas. ¡Fin de la ronda!');
  }

  /** Arma la frase que se dice en voz alta para una carta. */
  private textoDe(carta: Carta): string {
    return this.decirNumero ? `Número ${carta.numero}: ${carta.nombre}` : carta.nombre;
  }

  private limpiarTemporizador(): void {
    if (this.temporizador !== null) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }
}
