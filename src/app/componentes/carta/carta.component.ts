import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Carta } from '../../modelos/carta';

/**
 * Muestra una carta: su imagen (carpeta barajas/), su número y su nombre.
 * Con [miniatura]="true" se dibuja pequeña, para el historial de cartas cantadas.
 */
@Component({
  selector: 'app-carta',
  templateUrl: './carta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaComponent {
  /** La carta a mostrar. */
  carta = input.required<Carta>();

  /** Dibujo reducido para listas; por defecto se muestra en grande. */
  miniatura = input(false);

  /** Las imágenes viven en la carpeta barajas/ (mapeada en angular.json). */
  get rutaImagen(): string {
    return `barajas/${this.carta().imagen}`;
  }
}
