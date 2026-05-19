import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import { useUserStore } from "../store/useUserStore";
import { Button } from "../components/ui/Button";
import { ErrorMessage, LoadingSpinner } from "../components/ui/Feedback";
import type { User } from "../types/api";

export function ProfileSelectorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveUser = useUserStore((s) => s.setActiveUser);

  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleSelect(user);
    },
  });

  function handleSelect(user: User) {
    setActiveUser(user);
    navigate("/dashboard");
  }

  function handleCreate() {
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim() });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)" }}>
            🔥
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-4xl)",
              fontWeight: 800,
              color: "var(--color-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            FIRE
          </h1>
          <p
            style={{
              marginTop: "var(--space-2)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Financial Independence · Retire Early
          </p>
        </div>

        {/* Profile cards */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-2)",
              marginBottom: "var(--space-5)",
              fontWeight: 500,
            }}
          >
            Who's managing finances today?
          </p>

          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "var(--space-8)",
              }}
            >
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <ErrorMessage
              message="Could not load profiles. Is the backend running?"
              style={{ marginBottom: "var(--space-4)" }}
            />
          )}

          {/* Existing users */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  padding: "var(--space-4)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all var(--duration-fast) var(--ease-out)",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.background = "rgba(245,158,11,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.background = "var(--color-surface-2)";
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--color-primary-dim)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "var(--text-lg)",
                    flexShrink: 0,
                  }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: "var(--color-text)" }}>
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--color-text-3)",
                    fontSize: "var(--text-lg)",
                  }}
                >
                  →
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          {users.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
                margin: "var(--space-5) 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "var(--color-border)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-3)",
                }}
              >
                or
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "var(--color-border)",
                }}
              />
            </div>
          )}

          {/* Create new profile */}
          {showCreate ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Your name"
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-2)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-base)",
                  outline: "none",
                  width: "100%",
                  transition: "border-color var(--duration-fast)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-border-2)";
                }}
              />
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleCreate}
                  loading={createMutation.isPending}
                  disabled={!newName.trim()}
                >
                  Create profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
              {createMutation.isError && (
                <ErrorMessage message="Could not create profile. Try again." />
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCreate(true)}
            >
              + Add new profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
