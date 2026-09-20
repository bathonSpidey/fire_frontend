import { useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { BookingKind, Broker, InvestmentSummary } from "../types";

// The overview (broker = null) or one broker's page. While another page loads, the previous data
// stays on screen (`loading` dims it), so switching tabs never blanks the page.
export const useInvestments = (broker: Broker | null) => {
  const [data, setData] = useState<InvestmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [brokers, setBrokers] = useState<Broker[]>(["N26", "Commerzbank"]); // the tabs, kept from the last answer

  useEffect(() => {
    let cancelled = false;
    const query = broker ? `?broker=${encodeURIComponent(broker)}` : "";
    fetch(`${API_BASE}/investments/summary${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        return res.json() as Promise<InvestmentSummary>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setBrokers(json.brokers.map((b) => b.broker));
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load the investments"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [broker, reloadKey]);

  // The household decides by hand that a booking is (not) an investment; everything is re-read after.
  const changeBooking = async (id: number, kind: BookingKind) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/investments/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Request failed (status ${res.status})`);
      }
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
    }
  };

  // `loading` is only true while the wanted page is not the one on screen.
  const stale = data !== null && data.broker !== broker;
  return { data, brokers, loading: loading || stale, error, changeBooking };
};
