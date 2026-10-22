# Arquitectura actualizada · 32 entidades

Se continúa el proyecto existente: React 19, Vite 7, TypeScript estricto, Tailwind 4 y SVG para gráficas. No se incorporó backend, cuenta, base remota ni biblioteca de UI que sustituya el diseño aprobado.

| Capa | Archivo/carpeta | Responsabilidad |
|---|---|---|
| Pantallas | `src/pages` | Portada, explorador, postal única, álbum, fuentes y ruta desconocida |
| Diseño compartido | `src/components`, `src/styles/app.css` | Anverso, reverso, avisos, gráfica, botones y tokens aprobados |
| Catálogo | `src/content/entities-catalog.json` | Clave oficial, índice editorial, nombre, slug, alias y código postal editorial |
| Narrativa | `src/content/postcards.json` | 32 títulos, introducciones, prompts, referencias de grupo y reflexiones editables |
| Datos | `src/data/states-2024.json` | 32 datasets de 2024, tres tasas y trazabilidad por observación |
| Auditoría | `src/data/import-audit.json` | Disponibilidad de originales, denominadores y comprobaciones que sí pueden ejecutarse |
| Ingestión | `scripts/csv.mjs`, `transform-data.mjs`, `participation.mjs`, `import-data.mjs` | Lectura y validación; enlace único por tasas y conteos de 32 filas con el consolidado, sin reconstruir conteos |
| Preguntas | `src/features/postcard/answers.ts` | Unión discriminada y resolución de cinco formatos |
| Sesión | `src/features/postcard/SessionProvider.tsx` | Selección y confirmación en memoria, por slug |
| Colección | `src/features/album` | Álbum v1, descubrimiento independiente y almacenamiento local |
| Pruebas | `tests` | Datos, respuestas, importación, almacenamiento y visor de viewports |

## Preguntas y contenido

`highest-rate` identifica el grupo mayor; `gap` calcula una diferencia absoluta en puntos porcentuales; `compare` evalúa si un grupo superó a otro; `rate` reconoce una tasa; `interpretation` distingue descripción de causalidad. Una función `resolveQuestion` devuelve opciones, respuesta, dato y explicación. `evaluateAnswer` utiliza ese mismo contrato y rechaza identificadores desconocidos. No se codifican respuestas en el JSX.

Las opciones numéricas incorrectas son alternativas de interacción y no se publican como hallazgos. El resultado presenta la cifra correcta, la unidad, el contexto y una fuente, incluso después de un error. Los grupos se conservan en orden de edad en las gráficas.

Liliana puede modificar textos del JSON sin tocar componentes. Los identificadores y referencias de grupos forman parte del contrato y deben conservarse o revisarse con pruebas. El texto explicativo con cifras se construye a partir de datos y plantillas en el evaluador para evitar cifras desactualizadas.

## Rutas y estados

`HashRouter` mantiene enlaces compatibles con Pages. La postal usa presentación, `?paso=pregunta` y `?paso=datos`. Desde el dato se navega a postal anterior/siguiente; la colección es circular y no exige un orden. El acceso directo al reverso permite leer sin responder.

Las 32 entidades se activan desde el registro de contenido; no hay copias de la pantalla de Jalisco. Se conserva Jalisco como tarjeta editorial destacada de portada y explorador.

## Persistencia y compatibilidad

Se mantiene `postales-mexico:album:v1` para conservar los álbumes del MVP. `savedIds` y `exploredIds` son listas de IDs estables, únicas y filtradas contra el catálogo. Guardar no se deduce de descubrir. Quitar no borra progreso; deshacer permite recuperar el guardado. Al recargar se restaura la colección; el evento `storage` sincroniza pestañas. Si falla el almacenamiento, la sesión continúa en memoria con aviso. Las respuestas no se persisten ni se envían a un servidor.

## Responsive y accesibilidad

Se mantienen tokens, tipografías locales, retícula y puntos de ruptura. El álbum se amplía a cuadrícula cuando tiene varias postales y vuelve a una columna en móvil. Los controles siguen siendo nativos, con foco visible, etiquetas, feedback accesible, acceso libre a tablas y movimiento reducido. Los anversos nuevos usan una composición abstracta compartida; no se inventó una ilustración territorial para cada estado.

## Publicación

El workflow existente de Pages valida datos, pruebas y recursos antes de publicar. Calcula la base según el repositorio y usa hash para la navegación. La identidad e historial del alojamiento de revisión se conservan. El repositorio de publicación es `johanpelayo/postales-mexico`. Los pasos de mantenimiento están en README.

La ingestión añade `originals.mjs` y `data/source-manifest.json`: hash por original, grupo, evidencia, porcentaje no especificado y abstención. La auditoría conserva los intervalos de compatibilidad de redondeo, diferenciados de conteos exactos.
