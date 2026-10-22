# Postales de un México que participa · Fase 3

Micrositio React + Vite + TypeScript + Tailwind CSS sobre el MVP existente, con **32 postales funcionales** y una plantilla compartida. Mantiene la identidad de archivo postal contemporáneo aprobada en Figma.

## Estado de entrega

- 32 entidades únicas, 96 tasas de participación de 2024 conservadas del consolidado recibido.
- Cinco formatos de pregunta; resultado correcto/incorrecto, consulta sin responder, fuente y explicación.
- Explorador con búsqueda, navegación entre postales, álbum voluntario, progreso descubierto y persistencia local.
- Fórmula corregida según manual INE: **Sí votaron / (Sí votaron + No votaron) × 100**. Se retiró la comparación incorrecta con la lista nominal.
- Tres originales «Mapa 03.1» conservados con SHA-256: 96 tasas cotejadas sin modificación y 96 porcentajes no especificados integrados. No se reconstruyen conteos ausentes. La edad se vincula mediante el consolidado y la confirmación del equipo; los originales no incluyen los filtros de Tableau. Véase `docs/DATOS.md`.

Sitio publicado: [Abrir las 32 postales](https://johanpelayo.github.io/postales-mexico/). El primer despliegue de Actions y la respuesta HTTP 200 se comprobaron; véase `docs/PRUEBAS.md`.

## Ejecutar

Node 22.12+ o versión compatible con Vite 7. En la carpeta del proyecto:

```sh
npm ci
npm run dev
```

Abrir la URL local informada por Vite. En el entorno administrado de Sites se utiliza el supervisor de preview. No hay backend, cuentas, claves ni base de datos remota.

```sh
node scripts/import-data.mjs  # importación reproducible del consolidado
npm run check                # integridad de datos, pruebas, TypeScript, build y recursos
npm test
npm run build
npm run preview
```

La navegación usa `HashRouter`: `/#/postal/baja-california-sur?paso=datos`. Recargar una postal no requiere configurar redirecciones del servidor. `VITE_BASE_PATH` define la ruta base y por defecto vale `/`.

## Textos editables

Liliana puede editar títulos, introducciones, preguntas y reflexiones en `src/content/postcards.json`. Los porcentajes viven exclusivamente en `src/data/states-2024.json`, generado desde CSV. Los textos explicativos de resultado se construyen en `src/features/postcard/answers.ts` con datos de la entidad; no se debe codificar una respuesta numérica dentro de un texto narrativo.

Las opciones y la respuesta se derivan del tipo de pregunta. Cambiar el grupo o tipo exige revisar también su prompt y ejecutar las pruebas. Los slugs e identificadores existentes deben conservarse para respetar enlaces y álbumes guardados.

## Publicación en GitHub Pages

Repositorio: [johanpelayo/postales-mexico](https://github.com/johanpelayo/postales-mexico). El workflow publica automáticamente cada push a `main` cuando Pages tiene **Source → GitHub Actions**.

Para continuar localmente:

```sh
git clone https://github.com/johanpelayo/postales-mexico.git
cd postales-mexico
npm ci
npm run check
```

Tras editar y verificar, crear un commit y subirlo a `main` o abrir una pull request. Consultar el resultado y la URL efectiva del job `deploy` en **Actions**. No se necesitan claves en el código.

El workflow `.github/workflows/pages.yml` instala con `npm ci`, valida datos, ejecuta pruebas, compila y comprueba recursos. Las pull requests no despliegan. Calcula `/<nombre-del-repositorio>/` para Pages de proyecto y `/` para un repositorio terminado en `.github.io`. Para dominio propio, configurar `PAGES_CUSTOM_DOMAIN=true` en variables de Actions y registrar el dominio en Pages.

Para ensayar una ruta de proyecto en **PowerShell**:

```powershell
$env:VITE_BASE_PATH="/postales-mexico/"
npm run build
npm run check:build
Remove-Item Env:VITE_BASE_PATH
```

En Bash: `VITE_BASE_PATH=/postales-mexico/ npm run build`, seguido de `VITE_BASE_PATH=/postales-mexico/ npm run check:build`.

La configuración `.openai/hosting.json` corresponde al alojamiento de revisión; no es necesaria para Pages. Se puede omitir en una copia destinada exclusivamente a GitHub. Se mantiene en el proyecto existente para conservar su identidad e historial.

El workflow exige `REQUIRE_VERIFIED_DATA=1` por defecto. La validación coteja los tres originales y verifica los hashes, la transformación y la compatibilidad de redondeo. Su alcance y limitaciones están documentados en `docs/DATOS.md`.

Referencias: [Vite](https://vite.dev/guide/static-deploy.html#github-pages) y [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Documentación

- `docs/DATOS.md`: informe de validación, correspondencia disponible y pendientes.
- `docs/POSTALES.md`: lista de las 32 postales, preguntas y tasas.
- `docs/PRUEBAS.md`: pruebas ejecutadas, resultados y límites.
- `docs/ARQUITECTURA.md`: responsabilidades, estado y persistencia.
- `docs/REVISION-VISUAL.md`: continuidad respecto de Figma.
- `docs/RECURSOS.md`: recursos y licencias.
