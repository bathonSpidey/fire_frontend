import { createContext, useContext } from "react";

export interface AuthActions {
  signOut: () => void;
}

export const AuthContext = createContext<AuthActions>({ signOut: () => undefined });

export const useAuth = (): AuthActions => useContext(AuthContext);
