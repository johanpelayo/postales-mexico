import { ButtonLink } from "../components/Button";
export function NotFoundPage() {
  return (
    <section className="page-container page-section stack">
      <p className="meta text-wine">UNA DIRECCIÓN POR ENCONTRAR</p>
      <h1 className="page-title">
        Esta postal todavía
        <br />
        no está disponible.
      </h1>
      <p>
        Elige una de las 32 entidades desde el explorador. Revisa el nombre de
        la dirección si llegaste mediante un enlace.
      </p>
      <ButtonLink to="/explorar">Volver al explorador</ButtonLink>
    </section>
  );
}
