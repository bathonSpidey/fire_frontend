import React, { useState } from "react";
import { API_BASE } from "../api";
import styles from "./Auth.module.css";

interface Props {
  pinSet: boolean;
  onSignedIn: () => void;
}

export const LoginPage: React.FC<Props> = ({ pinSet, onSignedIn }) => {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pin || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        onSignedIn();
        return;
      }
      const detail = await res.json().catch(() => null);
      setError(detail?.detail ?? `Sign-in failed (status ${res.status})`);
      setPin("");
    } catch {
      setError("Cannot reach the app. Is the laptop switched on and on the same Wi-Fi?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>Smartory</h1>
        {pinSet ? (
          <>
            <p className={styles.sub}>Enter the household PIN to continue.</p>
            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              placeholder="PIN"
              aria-label="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            <button className={styles.button} type="submit" disabled={busy || !pin}>
              {busy ? "Checking..." : "Sign in"}
            </button>
          </>
        ) : (
          <>
            <p className={styles.sub}>No PIN has been chosen yet, so the app can only be opened on the laptop itself.</p>
            <p className={styles.sub}>
              On the laptop, run <span className={styles.code}>uv run python scripts/set_pin.py</span> in the
              fire_backend folder, then reload this page.
            </p>
          </>
        )}
      </form>
    </div>
  );
};
