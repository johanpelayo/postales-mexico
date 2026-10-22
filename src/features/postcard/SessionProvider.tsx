import { createContext, useContext, useState, type ReactNode } from "react";
interface Response {
  selectedId: string | null;
  submittedId: string | null;
}
interface Session {
  responses: Record<string, Response>;
  update: (id: string, value: Partial<Response>) => void;
}
const SessionContext = createContext<Session | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<Record<string, Response>>({});
  function update(id: string, value: Partial<Response>) {
    setResponses((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? { selectedId: null, submittedId: null }),
        ...value,
      },
    }));
  }
  return (
    <SessionContext.Provider value={{ responses, update }}>
      {children}
    </SessionContext.Provider>
  );
}
export function usePostcardSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Falta SessionProvider.");
  return value;
}
