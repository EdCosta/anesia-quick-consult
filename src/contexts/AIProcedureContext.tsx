import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

export interface AIProcedureContextValue {
  procedureId?: string;
  procedureTitle?: string;
}

interface AIProcedureContextState {
  procedureContext: AIProcedureContextValue | null;
  setProcedureContext: Dispatch<SetStateAction<AIProcedureContextValue | null>>;
}

const AIProcedureContext = createContext<AIProcedureContextState | null>(null);

export function AIProcedureProvider({ children }: { children: ReactNode }) {
  const [procedureContext, setProcedureContext] = useState<AIProcedureContextValue | null>(null);

  const value = useMemo(
    () => ({
      procedureContext,
      setProcedureContext,
    }),
    [procedureContext],
  );

  return <AIProcedureContext.Provider value={value}>{children}</AIProcedureContext.Provider>;
}

export function useAIProcedureContext() {
  const context = useContext(AIProcedureContext);

  if (!context) {
    throw new Error('useAIProcedureContext must be used within AIProcedureProvider');
  }

  return context;
}
