import { useState } from "react";
import { Button, ButtonLink } from "../components/Button";
import { PostcardFront } from "../components/PostcardFront";
import { postcards } from "../content/postcards";
import { datasets } from "../data";
import { useAlbum } from "../features/album/AlbumProvider";
import { assetUrl } from "../utils/format";
export function AlbumPage() {
  const { snapshot, issue, dispatch } = useAlbum();
  const [removedId, setRemovedId] = useState<string | null>(null);
  const savedCards = snapshot.savedIds
    .map((id) => postcards[id])
    .filter(Boolean);
  function remove(id: string) {
    dispatch({ type: "remove", id });
    setRemovedId(id);
  }
  return (
    <section className="page-container page-section stack-xl">
      <header className="section-heading stack">
        <p className="meta text-wine">TU CORRESPONDENCIA</p>
        <h1>
          Historias que
          <br />
          quieres conservar.
        </h1>
        <p className="lead muted">
          {savedCards.length
            ? `${savedCards.length} ${savedCards.length === 1 ? "postal guardada." : "postales guardadas."}`
            : "Tu álbum está listo para su primera postal."}
        </p>
        <p className="small muted">
          Has descubierto {snapshot.exploredIds.length} de 32 historias.
          Descubrir no guarda automáticamente una postal.
        </p>
      </header>
      {removedId && (
        <div className="undo-notice" role="status">
          <p>Se quitó la postal de {postcards[removedId].entityName}.</p>
          <Button
            tone="secondary"
            onClick={() => {
              dispatch({ type: "save", id: removedId });
              setRemovedId(null);
            }}
          >
            Deshacer
          </Button>
        </div>
      )}
      {savedCards.length ? (
        <div className="album-collection">
          <div className="album-cards">
            {savedCards.map((card) => (
              <article key={card.id} className="stack">
                <PostcardFront
                  card={card}
                  dataset={datasets[card.datasetId]}
                  to={`/postal/${card.slug}?paso=datos`}
                />
                <p className="saved-label">
                  ✓ {card.entityName.toUpperCase()} / GUARDADA
                </p>
                <Button tone="ghost" onClick={() => remove(card.id)}>
                  Quitar {card.entityName} del álbum
                </Button>
              </article>
            ))}
          </div>
          <div className="stack album-collection__copy">
            <h2>
              Cada postal guarda
              <br />
              una pregunta nueva.
            </h2>
            <p className="lead muted">
              Puedes volver al dato sin responder otra vez. No necesitas
              completar una colección para aprender algo.
            </p>
            {savedCards.length === 1 && (
              <ButtonLink to={`/postal/${savedCards[0].slug}?paso=datos`}>
                Reabrir {savedCards[0].entityName}{" "}
                <span aria-hidden="true">→</span>
              </ButtonLink>
            )}
            <ButtonLink to="/explorar" tone="secondary">
              Explorar otras entidades
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="empty-album stack">
          <p className="meta text-wine">SIN POSTALES GUARDADAS TODAVÍA</p>
          <img
            src={assetUrl(postcards.jalisco.artwork)}
            width="600"
            height="400"
            alt=""
          />
          <h2>
            El primer descubrimiento
            <br />
            puede ser el tuyo.
          </h2>
          <p className="lead muted">
            Abre una postal y, si quieres conservarla, toca Guardar después de
            descubrir el dato.
          </p>
          <ButtonLink to="/explorar">
            Explorar mi primera postal <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      )}
      <hr />
      <p className="small muted">
        Colección opcional, sin cuentas ni puntos.{" "}
        {issue
          ? "El guardado solo está disponible durante esta sesión."
          : "Tu álbum se conserva solo en este navegador y puede perderse al borrar sus datos."}{" "}
        No se sincroniza entre dispositivos.
      </p>
    </section>
  );
}
