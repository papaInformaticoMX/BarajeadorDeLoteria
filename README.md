# 🎴 Lotería Mexicana · Cantor de cartas

Aplicación en **Angular** que baraja las 54 cartas de la lotería mexicana tradicional
y las canta en voz alta en español usando la **HTML5 Web Speech API**
(`window.speechSynthesis`).

## Cómo correrla

```bash
npm install     # solo la primera vez
npm start       # levanta el servidor de desarrollo
```

Después abre <http://localhost:4200> en el navegador.
Para generar la versión de producción: `npm run build` (queda en `dist/`).

> La voz funciona mejor en Chrome y Edge. Si el navegador no tiene síntesis de voz,
> la aplicación sigue mostrando las cartas en pantalla y avisa con un mensaje.

## Despliegue en GitHub Pages

La app se publica en <https://papainformaticomx.github.io/BarajeadorDeLoteria/>.

- **Automático**: cada push a `master` ejecuta `.github/workflows/deploy.yml`
  (build + publicación). Requiere que en *Settings > Pages > Source* esté
  seleccionado **GitHub Actions**.
- **Manual**: `npm run deploy` construye en producción y sube la carpeta a la
  rama `gh-pages` con `angular-cli-ghpages`. Para este modo, en
  *Settings > Pages > Source* hay que elegir la rama **gh-pages**.

El `baseHref` es relativo (`./` en `angular.json`), así la app funciona tanto en
`localhost` como en la subruta `/BarajeadorDeLoteria/`. Por eso las rutas de
`assets/cartas.json` y `barajas/…` se escriben sin `/` inicial.

## Cómo se juega

1. **Barajar nueva ronda**: mezcla las 54 cartas en un orden aleatorio (algoritmo Fisher-Yates).
2. **Comenzar a cantar**: muestra y lee en voz alta cada carta, una por una,
   con la pausa que configures. **Pausar** detiene el canto sin perder el avance.
3. **Siguiente carta**: avanza una carta a mano (útil para llevar el ritmo tú mismo).
4. **Detener**: regresa la ronda al inicio, en silencio.

Ajustes en pantalla:

- *Decir el número antes del nombre*: canta «Número 14: La Muerte» o solo «La Muerte».
- *Velocidad de voz*: de 0.6× (lento) a 1.4× (rápido).
- *Pausa entre cartas*: segundos de silencio entre carta y carta.

Debajo de los controles queda el historial con las cartas que ya se cantaron.

## Dónde está cada cosa

```
barajas/                              Las 54 imágenes (1.ElGallo.jpg … 54.LaRana.jpg)
src/assets/cartas.json                ★ Los textos: número, nombre e imagen de cada carta
src/app/modelos/carta.ts              La interfaz Carta (qué campos tiene una carta)
src/app/servicios/baraja.service.ts   Carga el JSON y baraja (Fisher-Yates)
src/app/servicios/voz.service.ts      Envoltorio de la Web Speech API (voz en español)
src/app/componentes/carta/            Dibuja una carta (grande o en miniatura)
src/app/app.component.*               La partida: orden, avance, botones y ajustes
src/styles.css                        Colores globales (variables CSS en :root)
```

## Cómo modificarla

- **Cambiar nombres o el orden de los textos**: edita `src/assets/cartas.json`.
  No hay que tocar ningún `.ts`: la aplicación lee el JSON al arrancar.
- **Agregar o reemplazar imágenes**: deja el archivo en `barajas/` y apunta el campo
  `imagen` del JSON a ese nombre de archivo.
- **Cambiar colores**: edita las variables de `:root` en `src/styles.css`.
- **Cambiar lo que se dice en voz alta**: método `textoDe()` en `app.component.ts`.
- **Cambiar el idioma o la voz**: constante `mensaje.lang` y método `elegirVoz()`
  en `voz.service.ts` (por defecto `es-MX`, con respaldo a cualquier voz `es-*`).

## Notas técnicas

- Angular 22 con componentes *standalone* y *signals* (`input()`), sin módulos NgModules.
- Las imágenes de `barajas/` y el JSON de `src/assets/` se publican como *assets*
  según el mapeo del archivo `angular.json` (se sirven en `/barajas/` y `/assets/`).
- `VozService` cancela la lectura anterior antes de hablar, para que dos cartas
  nunca se encimen, y avisa al componente cuando termina (`onend`) para programar
  la siguiente carta.
- Si el navegador no expone `speechSynthesis`, `VozService.soportada` es `false`
  y la interfaz muestra un aviso en lugar de fallar.
