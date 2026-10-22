# Informe de validación de datos · Fase 3

## Fórmula y conservación de cifras

Fuente metodológica: [Manual oficial INE, páginas 17–18](https://ine.mx/wp-content/uploads/2025/06/Manual-Conteos-Censales-2009-2024.pdf).

- Participación = Sí votaron / (Sí votaron + No votaron) × 100.
- No especificados = Registros no especificados / Lista nominal × 100.

La lista nominal incluye registros sin condición de voto especificada. Por eso Sí votaron / Lista nominal produce otro indicador. Se retiró el diagnóstico anterior que calificaba las tasas como inconsistentes por utilizar ese denominador. **No se cambió ninguna de las 96 tasas publicadas.** No especificado no equivale a voto nulo ni a abstención.

## Originales y correspondencia comprobada

Tres archivos originales conservados byte por byte, UTF-16LE con BOM y columnas separadas por tabulaciones, pese a su extensión CSV. Cada archivo contiene 32 entidades y año 2024.

| Grupo (años) | Original | SHA-256 |
|---|---|---|
| 18–19 | `Mapa 03.1.csv` | `59376be284183b8f061b3e6d0f0f5993292c914d953f529814ee3de31d019c76` |
| 20–24 | `Mapa 03.1 (1).csv` | `97ef6946d2707c532f9dfc437bf37878042a256ef2d3a8993beeab1c51fe3449` |
| 25–29 | `Mapa 03.1 (2).csv` | `fa5f6d0f04e4831671aaf4ad389ad9cf00457f81c195d07c6f4f30e0cc1111f2` |

El enlace de cada original con una edad se cotejó frente a las columnas explícitas del consolidado `INE_comparativo_estatal_18-29_2024 (1).csv`. Para cada grupo se compararon las 32 entidades, el año, las tasas de participación y los conteos exactos de lista nominal y Sí votaron. Cada archivo tiene una sola correspondencia posible entre los tres grupos. Coinciden los 96 registros sin cambiar tasas ni conteos. El equipo también confirmó la identificación de grupos.

**Límite documental:** los originales no incorporan edad ni otros filtros de Tableau. La correspondencia es única respecto del consolidado; no es evidencia independiente de todos los filtros seleccionados en la plataforma. Conservar capturas o exportación de filtros reforzaría la trazabilidad. La fecha de descarga original es desconocida y se mantiene `null`; se registra la recepción. No se afirma conocerla.

`data/source-manifest.json` fija archivo, grupo, hash y evidencia. Cada observación conserva archivo original, fila, columna, hash y referencia al consolidado. «México» se normaliza como «Estado de México», sin alterar cifras. Las claves oficiales se separan del índice editorial.

## Campos incorporados y ausencias

Los **96 porcentajes no especificados** se importan directamente de `% Votos no esp.`; también se conserva `% Abstención`. Los originales publican lista nominal y Sí votaron, pero no conteos exactos de No votaron ni de registros no especificados. `counts.notVoted` y `counts.nonSpecified` permanecen `null`. No se reconstruyen con porcentajes redondeados.

Jalisco, comprobación de ejemplo:

| Edad | Participación | Abstención | No especificado | Lista nominal | Sí votaron |
|---|---:|---:|---:|---:|---:|
| 18–19 | 54.8% | 45.2% | 6.1% | 239728 | 123373 |
| 20–24 | 47.6% | 52.4% | 6.1% | 759898 | 339717 |
| 25–29 | 46.6% | 53.4% | 5.9% | 745764 | 326840 |

## Controles reproducibles

1. Hash SHA-256 de los tres originales; BOM y codificación; tabulaciones, cabeceras y filas válidas.
2. Tres archivos y grupos únicos; 32 entidades únicas por archivo; año 2024; correspondencia única contra los grupos del consolidado.
3. Porcentajes con un decimal, finitos y entre 0 y 100; conteos enteros seguros y universos válidos.
4. Igualdad exacta de tasas, lista nominal y Sí votaron entre originales y consolidado.
5. Compatibilidad de participación y abstención, y de participación con lista nominal, Sí votaron y porcentaje no especificado, considerando los intervalos de redondeo de ±0.05 puntos porcentuales. Se intersectan intervalos de tasas posibles; **no se estima un conteo de No votaron**. Los 96 registros son compatibles. No equivale a verificar aritmética con todos los conteos exactos, porque faltan dos de ellos.
6. Regeneración completa del JSON y del informe de auditoría; comparación exacta con los archivos almacenados.
7. Respuesta única y retroalimentación de las 32 preguntas; gráficos y etiquetas a partir de los mismos datos.

```sh
node scripts/import-data.mjs
REQUIRE_VERIFIED_DATA=1 npm run validate:data
npm run check
```

`verified` indica el alcance anterior, detallado en `verificationScope`; no una certificación institucional ni una verificación independiente de filtros ausentes. La serie nacional 2009–2024 no se usa para inventar historias estatales. Las diferencias se expresan en puntos porcentuales y no se interpretan como causas ni como seguimiento de las mismas personas.
