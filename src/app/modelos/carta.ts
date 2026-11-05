/**
 * Una carta de la lotería mexicana, tal como viene descrita
 * en el archivo de textos src/assets/cartas.json.
 */
export interface Carta {
  /** Posición tradicional de la carta en la baraja (1 a 54). */
  numero: number;
  /** Nombre que se muestra en pantalla y se canta en voz alta. */
  nombre: string;
  /** Nombre del archivo de imagen dentro de la carpeta barajas/. */
  imagen: string;
}
