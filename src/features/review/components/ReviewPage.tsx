import React, { useState } from "react";
import { useReviewQuestions } from "../hooks/useReviewQuestions";
import type { ReviewQuestion } from "../hooks/useReviewQuestions";
import shared from "../../../shared/styles/upload.module.css";
import styles from "../styles/Review.module.css";

const KIND_LABEL: Record<ReviewQuestion["kind"], string> = {
  receipt_match: "Receipt <-> bank payment",
  transfer_match: "Transfer between your accounts",
  mirror_match: "PayPal payment <-> bank booking",
};

export const ReviewPage: React.FC = () => {
  const { questions, loading, error, answer } = useReviewQuestions();
  const [busyId, setBusyId] = useState<number | null>(null);

  const respond = async (id: number, yes: boolean) => {
    setBusyId(id);
    try {
      await answer(id, yes);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Questions</h1>
      <p className={styles.intro}>
        Claude matched what it could on its own. These are the ones it was not sure about. A
        &quot;No&quot; is remembered, so the same pair is not asked again.
      </p>

      {error && (
        <div className={shared.errorBox} role="alert">
          <span>{error}</span>
        </div>
      )}

      {loading && <div className={styles.empty}>Loading...</div>}

      {!loading && questions.length === 0 && (
        <div className={styles.empty}>Nothing to answer right now.</div>
      )}

      {questions.map((q) => (
        <div key={q.id} className={styles.card}>
          <div className={styles.kind}>{KIND_LABEL[q.kind]}</div>
          <p className={styles.question}>{q.question}</p>
          <div className={styles.actions}>
            <button
              className={styles.yes}
              disabled={busyId === q.id}
              onClick={() => respond(q.id, true)}
            >
              Yes
            </button>
            <button
              className={styles.no}
              disabled={busyId === q.id}
              onClick={() => respond(q.id, false)}
            >
              No
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
