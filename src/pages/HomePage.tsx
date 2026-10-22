import { ButtonLink } from "../components/Button";
import { PostcardFront } from "../components/PostcardFront";
import { postcards } from "../content/postcards";
import { datasets } from "../data";
export function HomePage() {
  const card = postcards.jalisco;
  return (
    <>
      <section className="home-hero page-container">
        <div className="home-hero__copy stack">
          <p className="meta text-wine">32 ENTIDADES · UNA COLECCIÓN ABIERTA</p>
          <h1 className="home-title">
            Un país.
            <br />
            32 historias
            <span className="desktop-line">
              <br />
              por descubrir.
            </span>
            <span className="mobile-period">.</span>
          </h1>
          <p className="lead muted">
            Descubre cómo participamos, una postal a la vez.
          </p>
          <ButtonLink to="/explorar" className="home-hero__cta">
            Explorar las postales <span aria-hidden="true">→</span>
          </ButtonLink>
          <p className="small muted home-hero__instruction">
            Elige un estado, haz una predicción y abre una nueva mirada. También
            puedes consultar sin responder.
          </p>
        </div>
        <div className="home-hero__visual">
          <PostcardFront
            card={card}
            dataset={datasets[card.datasetId]}
            to="/postal/jalisco"
            className="home-postcard"
          />
          <div className="home-hero__caption">
            <p className="meta text-wine">JALISCO · POSTAL DE LA COLECCIÓN</p>
            <p className="small muted">
              Ilustración conceptual · Archivo postal contemporáneo
            </p>
          </div>
        </div>
      </section>
      <section className="opening-reflection">
        <div className="page-container stack">
          <p className="meta">UN DATO ABRE UNA CONVERSACIÓN</p>
          <h2>Ninguna cifra cuenta toda la historia.</h2>
          <p>
            Votar permite intervenir en la elección de representantes. Mirar los
            datos nos ayuda a formular preguntas informadas, sin juzgar a las
            personas ni atribuirles motivos.
          </p>
        </div>
      </section>
    </>
  );
}
