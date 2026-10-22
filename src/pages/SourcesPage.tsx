import { ButtonLink } from "../components/Button";
import { datasets } from "../data";
import audit from "../data/import-audit.json";
import { entities } from "../content/entities";
export function SourcesPage() {
  const sample = datasets["jalisco-2024"];
  return (
    <section className="page-container page-section stack-xl">
      <header className="section-heading stack">
        <p className="meta text-wine">LEER CON CONTEXTO</p>
        <h1>
          Una buena historia
          <br />
          empieza por su fuente.
        </h1>
      </header>
      <article className="methodology-panel stack-xl">
        <section className="stack">
          <h2>Qué estás viendo</h2>
          <p>
            32 postales con información agregada de participación electoral en
            2024. Cada una compara tres grupos: 18–19, 20–24 y 25–29 años. Las
            tasas se conservan tal como aparecen en los originales del INE,
            cotejados con el consolidado proporcionado por el equipo; no se reemplazaron por cálculos sobre
            la lista nominal.
          </p>
        </section>
        <section className="stack">
          <h2>Cómo se calcula la participación</h2>
          <p>
            El Manual de uso de los Conteos Censales del INE, páginas 17–18,
            define dos denominadores diferentes:
          </p>
          <p>
            <strong>
              Participación (%) = Sí votaron / (Sí votaron + No votaron) × 100.
            </strong>
          </p>
          <p>
            <strong>
              Voto no especificado (%) = Registros no especificados / Lista
              nominal × 100.
            </strong>
          </p>
          <p>
            La lista nominal también incluye registros sin condición de voto
            especificada. Estos se excluyen del denominador de participación.
            Por eso, dividir «Sí votaron» entre toda la lista nominal produce
            otro indicador y no sirve para rechazar la tasa publicada.
          </p>
          <p>
            «No especificado» no significa voto nulo ni abstención. El manual lo
            relaciona con falta de información en los cuadernillos o sus
            páginas. No permite atribuir una decisión a cada persona.
          </p>
          <a
            href={sample.provenance.manualUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar manual oficial del INE, páginas 17–18 (abre otra pestaña)
            ↗
          </a>
        </section>
        <section className="stack" id="validacion" tabIndex={-1}>
          <h2>Qué se comprobó</h2>
          <p>Se cotejaron los tres archivos originales «Mapa 03.1» con el consolidado: 32 entidades únicas, año 2024, 96 tasas de participación y los conteos publicados de lista nominal y «Sí votaron». Las tasas se conservan sin cambios. Se incorporaron los 96 porcentajes de voto no especificado.</p>
          <p>Los conteos y los porcentajes son compatibles con la fórmula oficial dentro de los intervalos de redondeo a un decimal. Esta comprobación no reconstruye conteos exactos de «No votaron» ni de registros no especificados: ambos permanecen como no disponibles.</p>
          <p>Los originales no incluyen una columna de edad ni los filtros de Tableau. La correspondencia de grupos es única al comparar las 32 filas de cada archivo —entidad, año, lista nominal, «Sí votaron» y participación— con las columnas explícitas del consolidado, además de la confirmación del equipo. No equivale a verificar independientemente todos los filtros de la exportación.</p>
          <p className="small muted">Manifiesto de procedencia: <code>{sample.provenance.rawFile}</code><br />SHA-256: <code className="checksum">{sample.provenance.sha256}</code></p>
        </section>
        <section className="stack">
          <h2>Correspondencia de grupos</h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Correspondencia de grupos y fuentes">
            <table>
              <caption>Tres originales conservados sin modificar; 32 filas cotejadas por archivo.</caption>
              <thead><tr><th scope="col">Edad</th><th scope="col">Archivo original</th><th scope="col">Huella SHA-256</th></tr></thead>
              <tbody>{audit.sourceFiles.map((f) => <tr key={f.groupId}><th scope="row">{f.groupId.replace("-", "–")} años</th><td>{f.file}</td><td><code className="checksum">{f.sha256}</code></td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <section className="stack">
          <h2>Cómo leer las cifras</h2>
          <p>
            Las barras comparten una escala de 0 a 100. La tabla ofrece los
            mismos valores en texto. Los porcentajes conservan el decimal del
            consolidado; una diferencia entre tasas se expresa en{" "}
            <strong>puntos porcentuales</strong>, no como variación relativa.
          </p>
          <p>
            Las preguntas y sus respuestas se calculan con las tasas de la
            entidad seleccionada. Cuando una opción propone una interpretación
            causal, la explicación aclara que estas cifras por sí solas no la
            demuestran.
          </p>
          <p>
            Los grupos de edad son distintos: no se sigue a las mismas personas
            a través del tiempo. Tampoco se comparan cantidades de votantes como
            si fueran tasas cuando sus universos son distintos.
          </p>
        </section>
        <section className="stack">
          <h2>Años y alcance</h2>
          <p>
            Estas postales corresponden a 2024. La serie nacional de trabajo
            recibida incluye 2009, 2012, 2015, 2018, 2021 y 2024; no contiene
            una dimensión estatal y no se utilizó para inventar series
            históricas por entidad. Los rangos de edad, filtros y estrato deben
            conservarse al cotejar futuras exportaciones.
          </p>
        </section>
        <section className="stack">
          <h2>Las 32 entidades</h2>
          <p>{entities.map((e) => e.name).join(" · ")}.</p>
          <p>
            La clave de entidad y el índice editorial de cada postal se
            almacenan por separado. La colección no es un ranking ni una
            evaluación de la ciudadanía.
          </p>
        </section>
        <section className="stack">
          <h2>Privacidad y recursos visuales</h2>
          <p>
            El álbum y las historias descubiertas se conservan solo en este
            navegador. Las respuestas permanecen en memoria durante la visita y
            no se envían a un servidor. No pedimos cuenta, ubicación ni
            preferencias políticas.
          </p>
          <p>
            La ilustración conceptual de Jalisco pertenece a la fase de diseño.
            Las otras postales usan una composición editorial abstracta
            compartida: no representa un lugar, una costumbre ni un
            acontecimiento real. Las imágenes no son evidencia estadística. Las
            tipografías se sirven localmente con sus licencias abiertas.
          </p>
        </section>
        <a
          className="button button--secondary"
          href={sample.provenance.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir plataforma oficial del INE (otra pestaña) ↗
        </a>
        <ButtonLink to="/explorar">Volver al explorador</ButtonLink>
        <p className="small muted">
          Proyecto para Hackathon INE 2026. No es un sitio oficial autorizado ni
          implica aval institucional.
        </p>
      </article>
    </section>
  );
}
