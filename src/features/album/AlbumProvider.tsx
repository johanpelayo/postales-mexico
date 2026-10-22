import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { postcardIds } from "../../content/postcards";
import {
  albumReducer,
  loadAlbum,
  parseAlbum,
  saveAlbum,
  STORAGE_KEY,
  type AlbumAction,
  type AlbumSnapshot,
  type StorageLike,
} from "./storage";

function browserStorage(): StorageLike | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
interface AlbumContextValue {
  snapshot: AlbumSnapshot;
  issue: string | null;
  dispatch: (action: AlbumAction) => void;
}
const AlbumContext = createContext<AlbumContextValue | null>(null);
export function AlbumProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() =>
    loadAlbum(browserStorage(), postcardIds),
  );
  const dispatch = useCallback(
    (action: AlbumAction) => {
      const next = albumReducer(state.snapshot, action, postcardIds);
      if (next === state.snapshot) return;
      const persisted = saveAlbum(browserStorage(), next);
      setState({
        snapshot: next,
        issue: persisted
          ? null
          : "El álbum está disponible en esta sesión, pero no pudimos conservarlo al recargar. Revisa si el navegador permite almacenamiento local.",
      });
    },
    [state.snapshot],
  );
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        setState({
          snapshot: parseAlbum(event.newValue, postcardIds),
          issue: null,
        });
      } catch {
        setState((current) => ({
          ...current,
          issue:
            "El álbum cambió en otra pestaña, pero no pudimos leerlo. Tu colección de esta sesión sigue disponible.",
        }));
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <AlbumContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AlbumContext.Provider>
  );
}
export function useAlbum() {
  const value = useContext(AlbumContext);
  if (!value) throw new Error("Falta AlbumProvider.");
  return value;
}
