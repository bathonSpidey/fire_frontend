import React from "react";
import type { ToolCall } from "../types";
import styles from "../styles/Insights.module.css";

// Turns one logged tool call into a short, readable line - the objective record of what was
// actually queried (written by the MCP server itself, not self-reported by the model).
const describe = (call: ToolCall): string => {
  const { tool, ...rest } = call;
  if (tool === "run_readonly_query") return `SQL: ${String(rest.sql)}`;
  const params = Object.entries(rest)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  return `${tool}(${params})`;
};

export const ToolTrace: React.FC<{ trace: ToolCall[] }> = ({ trace }) => {
  if (trace.length === 0) return null;
  return (
    <details className={styles.trace}>
      <summary>How I got this ({trace.length} lookup{trace.length === 1 ? "" : "s"})</summary>
      <ul className={styles.traceList}>
        {trace.map((call, i) => (
          <li key={i}>
            <code>{describe(call)}</code>
          </li>
        ))}
      </ul>
    </details>
  );
};
