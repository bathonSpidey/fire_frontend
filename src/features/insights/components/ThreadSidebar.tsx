import React, { useState } from "react";
import type { ThreadSummary } from "../types";
import styles from "../styles/Insights.module.css";

const monthKey = (iso: string): string => iso.slice(0, 7); // YYYY-MM
const monthLabel = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

interface RowProps {
  thread: ThreadSummary;
  active: boolean;
  onSelect: (id: number) => void;
  onPin: (id: number, pinned: boolean) => void;
  onDelete: (id: number) => void;
}

const ThreadRow: React.FC<RowProps> = ({ thread, active, onSelect, onPin, onDelete }) => (
  <div className={`${styles.threadRow} ${active ? styles.threadRowActive : ""}`}>
    <button type="button" className={styles.threadTitle} onClick={() => onSelect(thread.id)}>
      {thread.title || "New conversation"}
    </button>
    <div className={styles.threadActions}>
      <button
        type="button"
        className={styles.iconButton}
        title={thread.pinned ? "Unpin" : "Pin so this is never archived"}
        onClick={() => onPin(thread.id, !thread.pinned)}
      >
        {thread.pinned ? "📌" : "📍"}
      </button>
      <button type="button" className={styles.iconButton} title="Delete for good" onClick={() => onDelete(thread.id)}>
        🗑
      </button>
    </div>
  </div>
);

interface Props {
  threads: ThreadSummary[];
  activeThreadId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onPin: (id: number, pinned: boolean) => void;
  onDelete: (id: number) => void;
}

export const ThreadSidebar: React.FC<Props> = ({ threads, activeThreadId, onSelect, onNew, onPin, onDelete }) => {
  const [showArchived, setShowArchived] = useState(false);

  const pinned = threads.filter((t) => t.pinned);
  const archivedCount = threads.filter((t) => !t.pinned && t.archived).length;
  const visible = threads.filter((t) => !t.pinned && (showArchived || !t.archived));

  const groups = new Map<string, ThreadSummary[]>();
  for (const t of visible) {
    const key = monthKey(t.updated_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return (
    <div className={styles.sidebar}>
      <button type="button" className={styles.newButton} onClick={onNew}>
        + New conversation
      </button>

      {pinned.length > 0 && (
        <div className={styles.threadGroup}>
          <h4 className={styles.groupLabel}>Pinned</h4>
          {pinned.map((t) => (
            <ThreadRow key={t.id} thread={t} active={t.id === activeThreadId} onSelect={onSelect} onPin={onPin} onDelete={onDelete} />
          ))}
        </div>
      )}

      {[...groups.entries()].map(([key, rows]) => (
        <div className={styles.threadGroup} key={key}>
          <h4 className={styles.groupLabel}>{monthLabel(key)}</h4>
          {rows.map((t) => (
            <ThreadRow key={t.id} thread={t} active={t.id === activeThreadId} onSelect={onSelect} onPin={onPin} onDelete={onDelete} />
          ))}
        </div>
      ))}

      {threads.length === 0 && <span className={styles.hint}>No conversations yet.</span>}

      {archivedCount > 0 && (
        <button type="button" className={styles.archiveToggle} onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? "Hide archived" : `Show ${archivedCount} archived (30+ days, unpinned)`}
        </button>
      )}
    </div>
  );
};
