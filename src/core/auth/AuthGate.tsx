import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../api";
import { AuthContext } from "./AuthContext";
import { LoginPage } from "./LoginPage";

type Gate = "loading" | "signed-in" | "signed-out" | "unreachable";

const SIGNED_OUT_EVENT = "fire:signed-out";

const urlOf = (input: RequestInfo | URL): string =>
  typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

// Every part of the app calls the API with plain fetch; a 401 from any of them (the session
// ran out, or the PIN was changed) sends the person back to the PIN screen instead of an error.
const watchForSignOut = (): (() => void) => {
  const original = window.fetch;
  window.fetch = async (input, init) => {
    const response = await original(input, init);
    const url = urlOf(input);
    if (response.status === 401 && url.startsWith(API_BASE) && !url.startsWith(`${API_BASE}/auth/`)) {
      window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
    }
    return response;
  };
  return () => {
    window.fetch = original;
  };
};

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gate, setGate] = useState<Gate>("loading");
  const [pinSet, setPinSet] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const stop = watchForSignOut();
    const onSignedOut = () => setGate("signed-out");
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);

    fetch(`${API_BASE}/auth/status`)
      .then((res) => res.json())
      .then((status: { pin_set: boolean; authenticated: boolean }) => {
        if (cancelled) return;
        setPinSet(status.pin_set);
        setGate(status.authenticated ? "signed-in" : "signed-out");
      })
      .catch(() => !cancelled && setGate("unreachable"));

    return () => {
      cancelled = true;
      window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
      stop();
    };
  }, []);

  const signOut = useCallback(() => {
    fetch(`${API_BASE}/auth/logout`, { method: "POST" }).finally(() => setGate("signed-out"));
  }, []);
  const actions = useMemo(() => ({ signOut }), [signOut]);

  if (gate === "loading") return null;
  if (gate === "unreachable") {
    return (
      <div style={{ padding: 32, lineHeight: 1.6 }}>
        Cannot reach the app. Check that the laptop is switched on and on the same Wi-Fi, then reload.
      </div>
    );
  }
  if (gate === "signed-out") return <LoginPage pinSet={pinSet} onSignedIn={() => setGate("signed-in")} />;
  return <AuthContext.Provider value={actions}>{children}</AuthContext.Provider>;
};
