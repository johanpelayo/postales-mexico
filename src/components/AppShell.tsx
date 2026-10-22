import { postcards } from "../content/postcards";
import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ButtonLink } from "./Button";
import { useAlbum } from "../features/album/AlbumProvider";

export function AppShell() {
  const location = useLocation();
  const { issue } = useAlbum();
  const mainRef = useRef<HTMLElement>(null);
  const initial = useRef(true);
  useEffect(() => {
    const page = location.pathname.startsWith("/postal")
      ? postcards[location.pathname.split("/")[2]]?.entityName || "Postal"
      : location.pathname === "/explorar"
        ? "Explorar"
        : location.pathname === "/album"
          ? "Mi álbum"
          : location.pathname === "/fuentes"
            ? "Fuentes y metodología"
            : "Inicio";
    document.title = `${page} · Postales de un México que participa`;
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView();
        target.focus();
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (!initial.current && !location.search.includes("paso=datos"))
        mainRef.current?.focus({ preventScroll: true });
    }
    initial.current = false;
  }, [location.pathname, location.search, location.hash]);
  return (
    <>
      <a
        href="#contenido"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="site-header__row">
          <Link className="brand" to="/">
            <span className="meta text-wine">CORRESPONDENCIA CIUDADANA</span>
            <span className="brand__name">
              Postales de un México que participa
            </span>
          </Link>
          <nav aria-label="Navegación principal" className="primary-nav">
            {[
              ["/explorar", "Explorar"],
              ["/album", "Mi álbum"],
              ["/fuentes", "Fuentes"],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link--active" : "nav-link"
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {issue && (
        <div className="storage-notice" role="status">
          {issue}
        </div>
      )}
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p className="meta">POSTALES DE UN MÉXICO QUE PARTICIPA</p>
        <p>
          Una colección para mirar la participación con más preguntas y mejores
          fuentes.
        </p>
        <ButtonLink to="/fuentes" tone="inverse">
          Metodología y fuentes
        </ButtonLink>
        <p className="legal">
          Prototipo para Hackathon INE 2026. No es un sitio oficial autorizado.
          El álbum se guarda solo en este navegador.
        </p>
      </footer>
    </>
  );
}
