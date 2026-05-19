import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  accept?: string;
}

const ACCEPTED = ".pdf,image/png,image/jpeg,image/webp";

export function DropZone({
  onFile,
  disabled = false,
  accept = ACCEPTED,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // reset so same file can be re-uploaded
    e.target.value = "";
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border-2)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-16)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: dragging ? "rgba(245,158,11,0.04)" : "var(--color-surface)",
        transition: "all var(--duration-base) var(--ease-out)",
        minHeight: "220px",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: dragging
            ? "rgba(245,158,11,0.12)"
            : "var(--color-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          transition: "all var(--duration-base) var(--ease-out)",
        }}
      >
        {dragging ? "↓" : "↑"}
      </div>

      <div>
        <p
          style={{
            fontWeight: 500,
            color: "var(--color-text)",
            marginBottom: "var(--space-1)",
          }}
        >
          {dragging ? "Drop to upload" : "Drop your file here"}
        </p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
          or click to browse — PDF, PNG, JPG, WEBP
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
