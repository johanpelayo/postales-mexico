import { Link } from "react-router-dom";
import type { ElectoralDataset } from "../data/types";
export function DataStatusNotice({
  data,
  compact = false,
}: {
  data: ElectoralDataset;
  compact?: boolean;
}) {
  if (data.provenance.status === "verified") return null;
  return (
    <div className="data-notice" role="note">
      <strong>
        {data.provenance.status === "team-confirmed"
          ? "Tasas confirmadas por el equipo · INE 2024"
          : "Datos pendientes de validación"}
      </strong>
      {!compact && (
        <p>
          Conservamos las tasas publicadas. El cotejo directo de los originales
          y los porcentajes no especificados aún debe incorporarse.{" "}
          <Link to="/fuentes#validacion">Ver trazabilidad</Link>.
        </p>
      )}
    </div>
  );
}
