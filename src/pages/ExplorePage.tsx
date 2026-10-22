import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonLink } from "../components/Button";
import { PostcardFront } from "../components/PostcardFront";
import { postcards } from "../content/postcards";
import { searchEntities } from "../content/entities";
import { datasets } from "../data";
import { useAlbum } from "../features/album/AlbumProvider";
export function ExplorePage() {
  const [query, setQuery] = useState("");
  const results = searchEntities(query);
  const { snapshot } = useAlbum();
  const card = postcards.jalisco;
  const saved = snapshot.savedIds.includes(card.id);
  return (
    <section className="page-container page-section stack-xl">
      <header className="section-heading stack">
        <p className="meta text-wine">EL ARCHIVO / 32 ENTIDADES</p>
        <h1>
          ¿Desde dónde
          <br />
          quieres empezar?
        </h1>
        <p className="lead muted">
          Encuentra tu estado o comienza con una postal.
        </p>
      </header>
      <p className="small muted" role="status">
        Has descubierto {snapshot.exploredIds.length} de 32 historias ·{" "}
        {snapshot.savedIds.length}{" "}
        {snapshot.savedIds.length === 1
          ? "postal guardada."
          : "postales guardadas."}
      </p>
      <div className="search-field">
        <label htmlFor="entity-search" className="sr-only">
          Buscar una entidad
        </label>
        <span aria-hidden="true">⌕</span>
        <input
          id="entity-search"
          type="search"
          placeholder="Buscar una entidad"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          aria-describedby="search-help"
        />
        {query && (
          <Button tone="ghost" onClick={() => setQuery("")}>
            Limpiar
          </Button>
        )}
      </div>
      <p id="search-help" className="sr-only">
        Puedes buscar nombres sin acentos. Las 32 entidades están disponibles.
      </p>
      {!query && (
        <article className="featured-postcard">
          <div className="stack">
            <p className="meta text-wine">UNA POSTAL PARA COMENZAR</p>
            <h2>Jalisco</h2>
            <p className="lead muted">
              Tres edades, una mirada. Abre la postal y descubre qué podemos
              leer en una comparación.
            </p>
            <ButtonLink
              to={saved ? "/postal/jalisco?paso=datos" : "/postal/jalisco"}
            >
              {saved ? "Reabrir postal guardada" : "Abrir la postal de Jalisco"}
            </ButtonLink>
            <img
              className="featured-postcard__mobile-art"
              src={`${import.meta.env.BASE_URL}assets/jalisco.jpg`}
              alt=""
              width="600"
              height="400"
            />
          </div>
          <div className="featured-postcard__front">
            <PostcardFront
              card={card}
              dataset={datasets[card.datasetId]}
              to={saved ? "/postal/jalisco?paso=datos" : "/postal/jalisco"}
              compact
            />
          </div>
        </article>
      )}
      <section className="stack" aria-labelledby="entities-title">
        <div className="stack-sm">
          <h2 id="entities-title" className="subheading">
            {query ? "Resultados de búsqueda" : "Todas las entidades"}
          </h2>
          <p className="small muted">
            Las 32 entidades, en orden alfabético. Abre una postal para
            descubrir su historia.
          </p>
          <p role="status" aria-live="polite" className="small muted">
            {query
              ? `${results.length} ${results.length === 1 ? "entidad encontrada" : "entidades encontradas"}.`
              : ""}
          </p>
        </div>
        {results.length ? (
          <ul className="entity-grid">
            {results.map((entity) => {
              const entitySaved =
                !!entity.postcardId &&
                snapshot.savedIds.includes(entity.postcardId);
              return (
                <li key={entity.id}>
                  {entity.available ? (
                    <Link
                      to={`/postal/${entity.slug}${entitySaved ? "?paso=datos" : ""}`}
                      className="entity-tile entity-tile--available"
                    >
                      <span className="meta">
                        {entity.number} /{" "}
                        {entitySaved
                          ? "GUARDADA"
                          : entity.postcardId &&
                              snapshot.exploredIds.includes(entity.postcardId)
                            ? "DESCUBIERTA"
                            : "DISPONIBLE"}
                      </span>
                      <strong>
                        {entity.name}
                        <span aria-hidden="true"> ↗</span>
                      </strong>
                    </Link>
                  ) : (
                    <div className="entity-tile entity-tile--unavailable">
                      <span className="meta">
                        {entity.number} / PRÓXIMAMENTE
                      </span>
                      <span>{entity.name}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-search stack">
            <h3>No encontramos esa entidad.</h3>
            <p>Prueba con otro nombre o vuelve a ver la lista completa.</p>
            <Button tone="secondary" onClick={() => setQuery("")}>
              Mostrar todas las entidades
            </Button>
          </div>
        )}
      </section>
    </section>
  );
}
