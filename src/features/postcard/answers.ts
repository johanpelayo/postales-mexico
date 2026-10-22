import type {
  ChoiceQuestion,
  ElectoralDataset,
  Observation,
} from "../../data/types";
import { ageLabel, percentage } from "../../utils/format";
export function highestRate(data: ElectoralDataset): Observation {
  const sorted = [...data.observations].sort((a, b) => b.ratePct - a.ratePct);
  if (!sorted.length || !Number.isFinite(sorted[0].ratePct))
    throw new Error("No hay tasas comparables.");
  if (sorted[1]?.ratePct === sorted[0].ratePct)
    throw new Error("Hay empate: esta pregunta requiere otra redacción.");
  return sorted[0];
}
export function percentagePoints(a: number, b: number) {
  if (![a, b].every((n) => Number.isFinite(n) && n >= 0 && n <= 100))
    throw new Error("Tasas inválidas.");
  return Math.round((a - b) * 10) / 10;
}
export interface QuestionOption {
  id: string;
  label: string;
}
export interface ResolvedQuestion {
  options: QuestionOption[];
  correctId: string;
  answerLabel: string;
  heading: string;
  value: string;
  valueLabel: string;
  explanation: string;
}
export function resolveQuestion(
  q: ChoiceQuestion,
  data: ElectoralDataset,
): ResolvedQuestion {
  const group = (id: string) => {
    const row = data.observations.find((o) => o.id === id);
    if (!row) throw new Error(`Grupo desconocido ${id}`);
    return row;
  };
  const label = (o: Observation) => ageLabel(o.ageMin, o.ageMax);
  const numerical = (correct: number, unit: string) => {
    const alternatives = [
      correct,
      Math.round((correct + 5) * 10) / 10,
      Math.max(0, Math.round((correct - 5) * 10) / 10),
      Math.round((correct + 10) * 10) / 10,
    ];
    const values = [...new Set(alternatives)]
      .filter((n) => n >= 0 && n <= 100)
      .slice(0, 3)
      .sort((a, b) => a - b);
    if (values.length !== 3)
      throw new Error("Se requieren tres opciones distintas.");
    return values.map((n) => ({
      id: n.toFixed(1),
      label:
        unit === "%" ? percentage(n) : `${n.toFixed(1)} puntos porcentuales`,
    }));
  };
  if (q.type === "highest-rate") {
    const high = highestRate(data),
      answerLabel = label(high);
    return {
      options: data.observations.map((o) => ({ id: o.id, label: label(o) })),
      correctId: high.id,
      answerLabel,
      heading: answerLabel,
      value: percentage(high.ratePct),
      valueLabel: `Participación del grupo de ${answerLabel} · ${data.entityName} · ${data.year}`,
      explanation: `En ${data.entityName}, el grupo de ${answerLabel} registró la mayor tasa entre los tres grupos comparados: ${percentage(high.ratePct)}. La proporción se refiere a personas con condición de voto especificada, no a toda la lista nominal.`,
    };
  }
  if (q.type === "gap") {
    const a = group(q.groupA),
      b = group(q.groupB),
      gap = Math.abs(percentagePoints(a.ratePct, b.ratePct));
    return {
      options: numerical(gap, "pp"),
      correctId: gap.toFixed(1),
      answerLabel: `${gap.toFixed(1)} puntos porcentuales`,
      heading: "La distancia entre edades.",
      value: gap.toFixed(1),
      valueLabel: `Puntos porcentuales entre ${label(a)} y ${label(b)}`,
      explanation: `Las tasas de ${label(a)} (${percentage(a.ratePct)}) y ${label(b)} (${percentage(b.ratePct)}) están separadas por ${gap.toFixed(1)} puntos porcentuales. Restar dos porcentajes da puntos porcentuales; no una variación relativa ni una explicación de causas.`,
    };
  }
  if (q.type === "compare") {
    const a = group(q.groupA),
      b = group(q.groupB),
      above = a.ratePct > b.ratePct,
      gap = Math.abs(percentagePoints(a.ratePct, b.ratePct));
    return {
      options: [
        { id: "yes", label: "Sí, lo superó" },
        { id: "no", label: "No, no lo superó" },
      ],
      correctId: above ? "yes" : "no",
      answerLabel: above ? "Sí, lo superó" : "No, no lo superó",
      heading: "Dos edades, dos cifras.",
      value: gap.toFixed(1),
      valueLabel: `Puntos porcentuales de diferencia · ${data.entityName} · ${data.year}`,
      explanation: `El grupo de ${label(a)} registró ${percentage(a.ratePct)} y el de ${label(b)}, ${percentage(b.ratePct)}. ${a.ratePct === b.ratePct ? "Sus tasas fueron iguales." : `La mayor de estas dos tasas corresponde a ${label(above ? a : b)}.`} Esta relación describe a esta entidad y este año; no se generaliza a todo México.`,
    };
  }
  if (q.type === "rate") {
    const o = group(q.groupId);
    return {
      options: numerical(o.ratePct, "%"),
      correctId: o.ratePct.toFixed(1),
      answerLabel: percentage(o.ratePct),
      heading: label(o),
      value: percentage(o.ratePct),
      valueLabel: `Participación · ${data.entityName} · ${data.year}`,
      explanation: `En el grupo de ${label(o)} de ${data.entityName}, la participación fue ${percentage(o.ratePct)}. Es una proporción entre quienes tienen condición de voto especificada. No significa que participó todo el grupo ni identifica decisiones individuales.`,
    };
  }
  if (q.type === "interpretation") {
    const high = highestRate(data);
    return {
      options: [
        {
          id: "limits",
          label: "No. Describe diferencias, pero no demuestra sus causas.",
        },
        {
          id: "cause",
          label: "Sí. La diferencia demuestra el motivo de no votar.",
        },
        {
          id: "individuals",
          label: "Sí. Permite conocer qué decidió cada persona.",
        },
      ],
      correctId: "limits",
      answerLabel: "No: estas tasas no prueban causas.",
      heading: "Lo que el dato no dice.",
      value: percentage(high.ratePct),
      valueLabel: `Mayor tasa de los tres grupos: ${label(high)} · ${data.year}`,
      explanation: `Las tasas de ${data.entityName} son ${data.observations.map((o) => `${percentage(o.ratePct)} (${label(o)})`).join(", ")}. Describen proporciones por grupo. Por sí solas no demuestran motivos, causas ni cambios individuales.`,
    };
  }
  throw new Error("Tipo de pregunta no implementado.");
}
export function evaluateAnswer(
  question: ChoiceQuestion,
  data: ElectoralDataset,
  optionId: string,
): boolean {
  const resolved = resolveQuestion(question, data);
  if (!resolved.options.some((o) => o.id === optionId))
    throw new Error("Opción de respuesta desconocida.");
  return resolved.correctId === optionId;
}
