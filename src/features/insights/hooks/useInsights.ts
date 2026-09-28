import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { InsightMessage, ThreadDetail, ThreadSummary } from "../types";

export const useInsights = () => {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch(`${API_BASE}/insights/threads`);
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      setThreads(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the conversation list");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  // Only the initial mount fetch runs inside the effect itself (with its own cancel guard);
  // every later refresh (after asking, pinning, deleting) calls loadThreads directly instead.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingThreads(true);
      try {
        const res = await fetch(`${API_BASE}/insights/threads`);
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const json = await res.json();
        if (!cancelled) setThreads(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the conversation list");
      } finally {
        if (!cancelled) setLoadingThreads(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadThread = useCallback(async (id: number) => {
    setLoadingThread(true);
    try {
      const res = await fetch(`${API_BASE}/insights/threads/${id}`);
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      setActiveThread(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this conversation");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  const selectThread = useCallback(
    (id: number) => {
      setError(null);
      setActiveThreadId(id);
      loadThread(id);
    },
    [loadThread],
  );

  const startNewThread = useCallback(() => {
    setError(null);
    setActiveThreadId(null);
    setActiveThread(null);
  }, []);

  const send = useCallback(
    async (question: string) => {
      setSending(true);
      setError(null);
      // Show the household's own message right away; the answer replaces this view once it lands.
      const optimistic: InsightMessage = {
        id: -Date.now(), role: "user", content: question, tool_trace: [], chart: null,
        created_at: new Date().toISOString(),
      };
      setActiveThread((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, optimistic] }
          : {
              id: -1, title: question, pinned: false,
              created_at: optimistic.created_at, updated_at: optimistic.created_at,
              messages: [optimistic],
            },
      );
      try {
        const res = await fetch(`${API_BASE}/insights/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: activeThreadId, question }),
        });
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const json: { thread_id: number; message: InsightMessage } = await res.json();
        setActiveThreadId(json.thread_id);
        await Promise.all([loadThread(json.thread_id), loadThreads()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not get an answer just now");
        // Drop the optimistic bubble again since nothing was actually saved.
        if (activeThreadId) await loadThread(activeThreadId);
        else setActiveThread(null);
      } finally {
        setSending(false);
      }
    },
    [activeThreadId, loadThread, loadThreads],
  );

  const pin = useCallback(
    async (id: number, pinned: boolean) => {
      await fetch(`${API_BASE}/insights/threads/${id}/pin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      await loadThreads();
    },
    [loadThreads],
  );

  const remove = useCallback(
    async (id: number) => {
      await fetch(`${API_BASE}/insights/threads/${id}`, { method: "DELETE" });
      if (id === activeThreadId) startNewThread();
      await loadThreads();
    },
    [activeThreadId, loadThreads, startNewThread],
  );

  return {
    threads, loadingThreads, activeThreadId, activeThread, loadingThread, sending, error,
    selectThread, startNewThread, send, pin, remove,
  };
};
