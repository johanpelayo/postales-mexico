import type { ElectoralDataset } from "../data/types";
import { ageLabel, percentage } from "../utils/format";
import { highestRate } from "../features/postcard/answers";
export function ParticipationChart({ data }: { data: ElectoralDataset }) {
  const highest = highestRate(data);
  return (
    <figure className="participation-chart" aria-labelledby="chart-title">
      <figcaption id="chart-title">
        <strong>Participación por grupo de edad</strong>
        <span className="meta">
          {data.entityName.toUpperCase()} · {data.year} · TASAS EN PORCENTAJE
        </span>
      </figcaption>
      <div className="chart-bars" aria-hidden="true">
        {data.observations.map((row) => (
          <div className="chart-row" key={row.id}>
            <div className="chart-row__label">
              <span>{ageLabel(row.ageMin, row.ageMax)}</span>
              <strong className={row.id === highest.id ? "text-wine" : ""}>
                {percentage(row.ratePct)}
              </strong>
            </div>
            <svg
              viewBox="0 0 100 2"
              preserveAspectRatio="none"
              className="chart-row__bar"
              focusable="false"
            >
              <rect width="100" height="2" rx="1" fill="var(--color-soft)" />
              <rect
                width={row.ratePct}
                height="2"
                rx="1"
                fill={
                  row.id === highest.id
                    ? "var(--color-wine)"
                    : "var(--color-forest)"
                }
              />
            </svg>
          </div>
        ))}
        <div className="chart-axis meta">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
      <p className="small muted">
        Cada barra usa la misma escala de 0 a 100. Las etiquetas ofrecen los
        valores también en texto.
      </p>
      <details className="chart-table">
        <summary>Ver tabla de datos y unidades</summary>
        <div className="table-wrap">
          <table>
            <caption>
              {data.entityName}, {data.year}.{" "}
              {data.provenance.status === "verified"
                ? "Porcentajes cotejados con originales."
                : "Tasas del consolidado; ver trazabilidad."}
            </caption>
            <thead>
              <tr>
                <th scope="col">Grupo de edad</th>
                <th scope="col">Participación (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.observations.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{ageLabel(row.ageMin, row.ageMax)}</th>
                  <td>{percentage(row.ratePct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
