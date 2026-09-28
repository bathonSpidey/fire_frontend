export interface ChartPoint {
  label: string;
  value: number;
}

export interface Chart {
  type: "bar" | "line" | "pie" | "table";
  title: string;
  points: ChartPoint[];
}

export interface ToolCall {
  tool: string;
  [key: string]: unknown;
}

export interface InsightMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  tool_trace: ToolCall[];
  chart: Chart | null;
  created_at: string;
}

export interface ThreadSummary {
  id: number;
  title: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  archived: boolean;
  message_count: number;
}

export interface ThreadDetail {
  id: number;
  title: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  messages: InsightMessage[];
}
