# Informe de pruebas · Fase 3

## Resultado ejecutado

**78 pruebas automatizadas aprobadas en 3 archivos**: 52 en `tests/phase3.test.ts`, 21 en `tests/csv.test.mjs` y 5 en `tests/originals.test.mjs`.

- 32 entidades, claves, slugs y postales únicos; catálogo completo y cinco familias de preguntas.
- Datos y respuesta única de cada una de las 32 postales, opciones sin duplicados, respuesta correcta e identificadores desconocidos.
- Jalisco conserva 54.8%, 47.6% y 46.6%; Baja California Sur evalúa correctamente 38.6% frente a 40.6%.
- Álbum de 32, serialización/restauración, quitar conservando descubrimiento, idempotencia, compatibilidad con el álbum v1 del MVP, datos corruptos, IDs desconocidos y almacenamiento bloqueado/cuota.
- CSV con BOM, CRLF, comillas y errores; entidades duplicadas/desconocidas, año incorrecto, tasa vacía y diferencias en puntos porcentuales.
- Fórmula Sí / (Sí + No), exclusión de no especificados, total de conteos, tolerancia de redondeo y porcentaje no especificado respecto de lista nominal.
- Ausencia de No votaron no produce un conteo estimado. Un porcentaje no especificado cero se conserva cuando sí existe en la fuente de prueba; no se confunde con ausencia.
- Validación rechaza porcentajes no especificados fuera de rango, grupos superpuestos/duplicados y una etiqueta de verificación sin originales.

`npm run check` completó integridad del CSV/JSON, pruebas, TypeScript estricto, build de Vite y comprobación de recursos. Se compiló además con `VITE_BASE_PATH=/postales-mexico/` y `check:build` confirmó referencias HTML/CSS, fuentes, licencias y recursos de las 32 postales. El visor de QA no se incluye en `dist`.

Se ejecutó también `REQUIRE_VERIFIED_DATA=1 node scripts/validate-data.mjs`: aprobado con los tres originales. Los nuevos controles rechazan archivos alterados, intercambio de grupos y redondeos incompatibles; comprueban las 96 tasas y porcentajes no especificados sin reconstruir conteos.

## Navegador: pruebas realizadas

Chrome en el entorno de revisión local. No se afirma haber probado dispositivos físicos ni otros motores.

| Comprobación | Resultado observado |
|---|---|
| Explorador | 32 enlaces a entidades únicas, disponibles y en orden alfabético |
| 32 rutas de reverso, escritorio | Cargan la entidad correcta; sin desbordamiento horizontal |
| 96 barras, escritorio | El ancho SVG coincide con cada etiqueta porcentual; tres grupos por postal |
| Respuestas de cinco formatos | Correcta e incorrecta con Espacio y Enter; 10 escenarios completados |
| Mayor tasa | Aguascalientes: respuesta 18–19 |
| Diferencia | Baja California: 9.5 puntos porcentuales |
| Comparación | Baja California Sur: No, 20–24 no superó a 25–29 |
| Tasa | Campeche: 52.2% |
| Interpretación | Chihuahua: las tasas no demuestran causas |
| Búsqueda y pregunta móvil | Buscar Baja California Sur, abrir pregunta, seleccionar y confirmar con teclado; feedback correcto |
| Consulta directa | Permite leer y guardar sin responder |
| Navegación circular | Zacatecas → Aguascalientes abre la presentación correcta |
| Álbum múltiple | Zacatecas y Aguascalientes guardadas; ambas permanecen después de recargar |
| Quitar y deshacer | Quitar Zacatecas deja una postal; Deshacer y recargar restaura dos |
| Progreso | 32 historias descubiertas conservadas al recargar; no obliga a guardar |

## Responsive

Se midió el contenido real de la aplicación dentro de un iframe con viewport definido en `tests/responsive.html`.

- **390 px:** los 32 reversos cargaron y dieron `clientWidth = scrollWidth = 375 px`, sin desbordamiento de página. Evidencia de mediciones en `docs/mobile-checks.json`. Los 15 px restantes corresponden a la barra de desplazamiento de Chrome.
- **390 px, pregunta de Baja California Sur:** selección y confirmación por teclado; mismo ancho sin desbordamiento.
- **320 px, reverso de Zacatecas:** `clientWidth = scrollWidth = 305 px` y revisión visual de titular, cifra y explicación.
- Escritorio: se recorrieron las 32 entidades y se midieron desbordamientos; se inspeccionó visualmente el álbum múltiple.

Un recorrido masivo con clics dentro del iframe agotó el tiempo de la herramienta de navegador. Se recuperó la sesión y se completó la revisión de los 32 reversos en bloques mediante enlaces directos de QA. No se reporta ese primer intento como prueba aprobada ni como un fallo del sitio sin evidencia adicional.

## Accesibilidad y límites

Radios y confirmación nativos operados con teclado, feedback textual, datos accesibles en tabla, foco visible y navegación sin mapa. Se conserva `prefers-reduced-motion`. No se realizó auditoría WCAG completa, prueba de lector de pantalla, zoom de texto ni cambio de preferencia del sistema. La ausencia de desbordamiento no sustituye esas pruebas.

## Cotejo de originales

Los tres originales están incorporados con hashes. Se cotejaron 96 tasas y sus conteos publicados con el consolidado, se importaron 96 porcentajes no especificados y se comprobó su compatibilidad con redondeo. Los originales no incluyen filtros de edad ni todos los conteos exactos: véase DATOS.md.

## Publicación

Workflow configurado para el repositorio `johanpelayo/postales-mexico`, Node 22 y base `/postales-mexico/`. El resultado remoto debe consultarse en Actions; las comprobaciones locales no sustituyen la verificación del despliegue.

## Cierre de publicación y revisión adicional

- GitHub Actions [39721853503](https://github.com/johanpelayo/postales-mexico/actions/runs/39721853503): jobs `build` y `deploy` completados con éxito sobre `eb546143a44d5476cff2c4095e709c867e088399`.
- URL emitida por el despliegue: https://johanpelayo.github.io/postales-mexico/ . Respuesta HTTP 200 y título correcto comprobados después de publicar. Esta comprobación HTTP no sustituye una prueba de interacción en el dominio público.
- Revisión local adicional tras incorporar originales: detalle de Jalisco muestra 6.1%, 6.1%, 5.9%; enlace de trazabilidad abre la sección correcta; metodología a 390 y 320 px sin desbordamiento de página (375/375 y 305/305 px útiles).
- Jalisco se guardó con Enter en el viewport móvil; tras recargar se restauró el estado guardado y el álbum mostró una postal de Jalisco.
- La revisión local usa Chrome; sigue pendiente una auditoría WCAG completa, lector de pantalla y dispositivos físicos.
