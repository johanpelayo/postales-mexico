import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "@fontsource/literata/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./styles/app.css";
import { AppShell } from "./components/AppShell";
import { AlbumProvider } from "./features/album/AlbumProvider";
import { SessionProvider } from "./features/postcard/SessionProvider";
import { HomePage } from "./pages/HomePage";
import { ExplorePage } from "./pages/ExplorePage";
import { PostcardPage } from "./pages/PostcardPage";
import { AlbumPage } from "./pages/AlbumPage";
import { SourcesPage } from "./pages/SourcesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AlbumProvider>
        <SessionProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="explorar" element={<ExplorePage />} />
              <Route path="postal/:slug" element={<PostcardPage />} />
              <Route path="album" element={<AlbumPage />} />
              <Route path="fuentes" element={<SourcesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SessionProvider>
      </AlbumProvider>
    </HashRouter>
  </React.StrictMode>,
);
