import React, { useEffect, useRef, useState } from "react";
import type { ThreadDetail } from "../types";
import { ChartRenderer } from "./ChartRenderer";
import { ToolTrace } from "./ToolTrace";
import styles from "../styles/Insights.module.css";

const SUGGESTIONS = [
  "How much have we spent on groceries in the last 6 months?",
  "What's Lena's flexible spending this month?",
  "Are there any subscriptions with a recent price rise?",
  "What was our biggest expense category last month?",
];

const time = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

interface Props {
  thread: ThreadDetail | null;
  loading: boolean;
  sending: boolean;
  error: string | null;
  onSend: (question: string) => void;
}

export const ChatThread: React.FC<Props> = ({ thread, loading, sending, error, onSend }) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = thread?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || sending) return;
    setInput("");
    onSend(q);
  };

  return (
    <div className={styles.chatPanel}>
      <div className={styles.messages}>
        {loading && <div className={styles.empty}>Loading...</div>}

        {!loading && messages.length === 0 && (
          <div className={styles.emptyChat}>
            <p>Ask anything about your own spending, subscriptions, net worth or FIRE progress.</p>
            <p className={styles.hint}>
              Claude answers from the app's own data - every lookup it makes is shown under the answer.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className={styles.suggestionChip} onClick={() => onSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}`}>
            <div className={styles.bubbleContent}>{m.content}</div>
            {m.chart && <ChartRenderer chart={m.chart} />}
            {m.role === "assistant" && <ToolTrace trace={m.tool_trace} />}
            <span className={styles.bubbleTime}>{time(m.created_at)}</span>
          </div>
        ))}

        {sending && (
          <div className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.thinking}`}>Thinking...</div>
        )}
        {error && <div className={styles.notice}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form className={styles.inputRow} onSubmit={submit}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data..."
          disabled={sending}
        />
        <button type="submit" className={styles.sendButton} disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
