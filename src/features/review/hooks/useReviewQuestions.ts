import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";

export interface ReviewQuestion {
  id: number;
  kind: "receipt_match" | "transfer_match" | "mirror_match";
  question: string;
  transaction_id: number;
  receipt_id: number | null;
  other_transaction_id: number | null;
  created_at: string | null;
}

// pollMs: also re-check periodically (used by the navbar badge); omit for one-off loading.
export const useReviewQuestions = (pollMs?: number) => {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setQuestions(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/reviews`)
      .then((res) => res.json())
      .then((list: ReviewQuestion[]) => setQuestions(list))
      .catch(() => setError("Could not load questions"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pollMs) return;
    const timer = setInterval(reload, pollMs);
    return () => clearInterval(timer);
  }, [pollMs, reload]);

  const answer = async (id: number, yes: boolean) => {
    setError(null);
    const res = await fetch(`${API_BASE}/reviews/${id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: yes ? "yes" : "no" }),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      setError(detail?.detail ?? `Could not save the answer (status ${res.status})`);
    }
    await reload(); // also drops questions that became moot in the meantime
  };

  return { questions, loading, error, answer, reload };
};
