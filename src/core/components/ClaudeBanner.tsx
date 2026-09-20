import React, { useEffect, useState } from "react";
import { API_BASE } from "../api";

const CHECK_EVERY_MS = 60_000;

// Claude Code on the laptop needs its own login for reading documents. If that lapses, say so on
// every page (a phone cannot fix it, but anyone can see why uploads fail and what to do).
export const ClaudeBanner: React.FC = () => {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () =>
      fetch(`${API_BASE}/claude/status`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!cancelled && json) setSignedOut(json.logged_in === false);
        })
        .catch(() => undefined);
    check();
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!signedOut) return null;
  return (
    <div
      role="alert"
      style={{
        margin: "12px 24px 0",
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius-lg)",
        border: "0.5px solid var(--warning-border)",
        background: "var(--warning-subtle)",
        color: "var(--warning-text)",
        lineHeight: 1.5,
      }}
    >
      Claude on the laptop is signed out, so new uploads cannot be read yet. On the laptop open a terminal, run{" "}
      <strong>claude</strong>, type <strong>/login</strong> and sign in. Uploads that failed can then be retried with
      &ldquo;Try again&rdquo;; nothing is lost.
    </div>
  );
};
