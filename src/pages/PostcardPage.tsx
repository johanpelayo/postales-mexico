import { useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, ButtonLink } from "../components/Button";
import { DataStatusNotice } from "../components/DataStatusNotice";
import { ParticipationChart } from "../components/ParticipationChart";
import { PostcardFront } from "../components/PostcardFront";
import { SourceNote } from "../components/SourceNote";
import { orderedPostcards, postcards } from "../content/postcards";
import { datasets } from "../data";
import { useAlbum } from "../features/album/AlbumProvider";
import { usePostcardSession } from "../features/postcard/SessionProvider";
import { evaluateAnswer, resolveQuestion } from "../features/postcard/answers";
import { ageLabel, assetUrl, percentage } from "../utils/format";
import { NotFoundPage } from "./NotFoundPage";

export function PostcardPage() {
  const { slug = "" } = useParams(),
    card = postcards[slug];
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { snapshot, issue, dispatch } = useAlbum();
  const { responses, update } = usePostcardSession();
  const resultRef = useRef<HTMLHeadingElement>(null);
  const step = ["pregunta", "datos"].includes(params.get("paso") || "")
    ? params.get("paso")
    : "presentacion";
  const response = responses[slug] || { selectedId: null, submittedId: null };
  const saved = !!card && snapshot.savedIds.includes(card.id);
  useEffect(() => {
    if (step === "datos" && card) {
      dispatch({ type: "explore", id: card.id });
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [step, card, dispatch]);
  if (!card) return <NotFoundPage />;
  const data = datasets[card.datasetId],
    resolved = resolveQuestion(card.question, data);
  const correct = response.submittedId
    ? evaluateAnswer(card.question, data, response.submittedId)
    : null;
  const chosenLabel = resolved.options.find(
    (o) => o.id === response.submittedId,
  )?.label;
  const index = orderedPostcards.findIndex((c) => c.id === card.id);
  const previous =
      orderedPostcards[
        (index - 1 + orderedPostcards.length) % orderedPostcards.length
      ],
    next = orderedPostcards[(index + 1) % orderedPostcards.length];
  function reveal(direct = false) {
    if (!direct && !response.selectedId) return;
    update(slug, { submittedId: direct ? null : response.selectedId });
    navigate(`/postal/${card.slug}?paso=datos`);
  }
  const back = (
    <ButtonLink to="/explorar" tone="ghost" className="back-link">
      ← Volver al explorador
    </ButtonLink>
  );
  if (step === "presentacion")
    return (
      <section className="page-container page-section stack page-enter">
        {back}
        <div className="postal-intro">
          <PostcardFront card={card} dataset={data} />
          <div className="stack">
            <p className="meta text-wine">
              {card.entityName.toUpperCase()} / {data.year} · POSTAL{" "}
              {card.number}
            </p>
            <h1>{card.title}</h1>
            <p className="lead muted">{card.introduction}</p>
            <DataStatusNotice data={data} />
            <ButtonLink to={`/postal/${slug}?paso=pregunta`}>
              Abrir la pregunta <span aria-hidden="true">→</span>
            </ButtonLink>
            <Button tone="ghost" onClick={() => reveal(true)}>
              Ver el dato sin responder
            </Button>
          </div>
        </div>
      </section>
    );
  if (step === "pregunta")
    return (
      <section className="page-container page-section question-page stack page-enter">
        {back}
        <div className="postal-question">
          <div className="postal-question__front">
            <PostcardFront card={card} dataset={data} />
          </div>
          <div className="postal-question__fragment">
            <p className="meta">
              {card.code} / {data.year} · POSTAL {card.number}
            </p>
            <img src={assetUrl(card.artwork)} alt="" width="600" height="400" />
          </div>
          <div className="question-panel stack">
            <p className="meta text-wine question-panel__eyebrow">
              ANTES DE ABRIR EL DATO
            </p>
            <h1>
              <span className="question-desktop-title">{card.title}</span>
              <span className="question-mobile-title">
                {card.questionTitle}
              </span>
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                reveal();
              }}
              className="stack"
            >
              <fieldset className="question-fieldset">
                <legend>{card.question.prompt}</legend>
                <DataStatusNotice data={data} compact />
                <div className="answer-list">
                  {resolved.options.map((option) => (
                    <label
                      key={option.id}
                      className={`answer-option ${response.selectedId === option.id ? "answer-option--selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`answer-${card.id}`}
                        value={option.id}
                        checked={response.selectedId === option.id}
                        onChange={() => update(slug, { selectedId: option.id })}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button type="submit" disabled={!response.selectedId}>
                {response.selectedId
                  ? "Revelar el dato →"
                  : "Elige una opción para revelar"}
              </Button>
            </form>
            <Button tone="ghost" onClick={() => reveal(true)}>
              Ver el dato sin responder
            </Button>
          </div>
        </div>
      </section>
    );
  return (
    <section className="page-container page-section stack page-enter">
      {back}
      <div className="postal-reveal">
        <aside className="postal-reveal__aside stack">
          <img src={assetUrl(card.artwork)} alt="" width="600" height="400" />
          <p className="meta text-wine">
            {card.code} / MÉXICO · {data.year}
          </p>
          <h2>
            Una postal.
            <br />
            Otra perspectiva.
          </h2>
          <p className="small muted">
            Guardar es opcional. Cada historia sigue abierta, con o sin álbum.
          </p>
          {saved && <p className="saved-label">✓ POSTAL GUARDADA</p>}
        </aside>
        <article className="postal-reverse stack">
          <p className="meta text-wine">
            {card.entityName.toUpperCase()} / {data.year} · REVERSO
          </p>
          <div className="feedback" role="status">
            {correct === null
              ? "Consulta directa · sin respuesta"
              : correct
                ? "✓ Tu predicción coincide con los datos"
                : "Tu elección no coincide. Aquí puedes descubrir el dato."}
            {chosenLabel && (
              <span className="feedback__choice">
                Tu elección: {chosenLabel}
              </span>
            )}
            {correct === false && (
              <span className="feedback__choice">
                Respuesta: {resolved.answerLabel}
              </span>
            )}
          </div>
          <DataStatusNotice data={data} />
          <h1 className="result-heading" ref={resultRef} tabIndex={-1}>
            {resolved.heading}
          </h1>
          <p className="result-number text-wine">{resolved.value}</p>
          <p className="small muted">{resolved.valueLabel}</p>
          <p>{resolved.explanation}</p>
          <hr />
          <ParticipationChart data={data} />
          <details className="chart-table">
            <summary>Registros de voto no especificado</summary>
            <p className="small muted">
              Estos porcentajes usan la lista nominal como denominador y no se
              confunden con abstención.
            </p>
            <ul className="stack-sm">
              {data.observations.map((row) => (
                <li key={row.id}>
                  {ageLabel(row.ageMin, row.ageMax)}:{" "}
                  {row.nonSpecifiedPct === null ||
                  row.nonSpecifiedPct === undefined
                    ? "No disponible en el consolidado; pendiente del original."
                    : percentage(row.nonSpecifiedPct)}
                </li>
              ))}
            </ul>
          </details>
          <hr />
          <h2 className="reflection-heading">{card.reflectionTitle}</h2>
          <p>{card.reflection}</p>
          <SourceNote data={data} />
          {saved ? (
            <>
              <p className="saved-label" role="status">
                ✓ Postal guardada{" "}
                {issue ? "durante esta sesión" : "en este navegador"}
              </p>
              <ButtonLink to="/album">
                Ver mi álbum <span aria-hidden="true">→</span>
              </ButtonLink>
              <Button
                tone="ghost"
                onClick={() => dispatch({ type: "remove", id: card.id })}
              >
                Quitar del álbum
              </Button>
            </>
          ) : (
            <Button onClick={() => dispatch({ type: "save", id: card.id })}>
              Guardar esta postal <span aria-hidden="true">+</span>
            </Button>
          )}
          <nav
            className="postcard-pagination"
            aria-label="Navegación entre postales"
          >
            <ButtonLink to={`/postal/${previous.slug}`} tone="secondary">
              ← {previous.entityName}
            </ButtonLink>
            <ButtonLink to={`/postal/${next.slug}`} tone="secondary">
              {next.entityName} →
            </ButtonLink>
          </nav>
          <ButtonLink to="/explorar" tone="ghost">
            Seguir explorando
          </ButtonLink>
          <p className="small muted" role="status">
            Has descubierto {snapshot.exploredIds.length} de 32 historias.
            Guardar sigue siendo opcional.
          </p>
        </article>
      </div>
    </section>
  );
}
