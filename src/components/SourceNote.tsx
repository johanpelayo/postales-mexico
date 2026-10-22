import type { ElectoralDataset } from "../data/types";
import { ButtonLink } from "./Button";
export function SourceNote({ data }: { data: ElectoralDataset }) {
  return (
    <aside className="source-note" aria-label="Procedencia del dato">
      <p className="meta">FUENTE Y METODOLOGÍA</p>
      <p>
        <strong>{data.provenance.title}</strong>
      </p>
      <p className="small muted">
        Participación = Sí votaron / (Sí votaron + No votaron) × 100. Los
        registros no especificados quedan fuera de ese denominador.
      </p>
      <ButtonLink to="/fuentes#validacion" tone="ghost">
        Consultar fuente y trazabilidad
      </ButtonLink>
    </aside>
  );
}
