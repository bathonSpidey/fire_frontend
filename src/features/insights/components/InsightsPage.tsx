import React from "react";
import { useInsights } from "../hooks/useInsights";
import { ChatThread } from "./ChatThread";
import { ThreadSidebar } from "./ThreadSidebar";
import styles from "../styles/Insights.module.css";

export const InsightsPage: React.FC = () => {
  const {
    threads, activeThreadId, activeThread, loadingThread, sending, error,
    selectThread, startNewThread, send, pin, remove,
  } = useInsights();

  return (
    <div className={styles.page}>
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelect={selectThread}
        onNew={startNewThread}
        onPin={pin}
        onDelete={remove}
      />
      <ChatThread thread={activeThread} loading={loadingThread} sending={sending} error={error} onSend={send} />
    </div>
  );
};
