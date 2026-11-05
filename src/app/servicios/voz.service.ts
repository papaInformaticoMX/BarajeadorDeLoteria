import { Injectable, NgZone, inject } from '@angular/core';

/**
 * Envoltorio amigable alrededor de la HTML5 Web Speech API
 * (window.speechSynthesis) para cantar las cartas en español.
 */
@Injectable({ providedIn: 'root' })
export class VozService {
  private readonly zona = inject(NgZone);

  /** null cuando el navegador no ofrece síntesis de voz. */
  private readonly sintesis: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  private voces: SpeechSynthesisVoice[] = [];

  /** Velocidad de lectura: 1 = velocidad normal, 0.6 = lento, 1.4 = rápido. */
  velocidad = 1;

  constructor() {
    if (this.sintesis) {
      // Algunos navegadores cargan las voces de forma asíncrona.
      this.sintesis.onvoiceschanged = () => this.cargarVoces();
      this.cargarVoces();
    }
  }

  /** true si el navegador puede hablar; si no, la app solo muestra las cartas. */
  get soportada(): boolean {
    return this.sintesis !== null;
  }

  private cargarVoces(): void {
    this.voces = this.sintesis?.getVoices() ?? [];
  }

  /** Elige la mejor voz en español disponible (prefiere es-MX). */
  private elegirVoz(): SpeechSynthesisVoice | undefined {
    return (
      this.voces.find((voz) => voz.lang === 'es-MX') ??
      this.voces.find((voz) => voz.lang.startsWith('es-419') || voz.lang.startsWith('es-US')) ??
      this.voces.find((voz) => voz.lang.startsWith('es'))
    );
  }

  /**
   * Lee el texto en voz alta en español.
   * @param alTerminar Se ejecuta (dentro de la zona de Angular) al acabar
   *                   la lectura o si ocurre un error; así la interfaz
   *                   puede avanzar a la siguiente carta.
   */
  hablar(texto: string, alTerminar?: () => void): void {
    if (!this.sintesis) {
      alTerminar?.();
      return;
    }
    // Cancela lo anterior para que dos cartas nunca se encimen.
    this.sintesis.cancel();

    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-MX';
    mensaje.rate = this.velocidad;
    const voz = this.elegirVoz();
    if (voz) {
      mensaje.voice = voz;
    }
    mensaje.onend = () => this.zona.run(() => alTerminar?.());
    mensaje.onerror = () => this.zona.run(() => alTerminar?.());
    this.sintesis.speak(mensaje);
  }

  /** Silencia la voz de inmediato. */
  callar(): void {
    this.sintesis?.cancel();
  }
}
