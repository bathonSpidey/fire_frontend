import React, { useEffect, useMemo, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import type { Category, NewCategory, RecheckScope } from "../hooks/useCategories";
import styles from "../styles/Categories.module.css";

const emptyForm: NewCategory = { label: "", group_name: "", flow: "expense", description: "", fixed: false };

const AddCategory: React.FC<{ groups: string[]; onAdd: (c: NewCategory) => void }> = ({ groups, onAdd }) => {
  const [form, setForm] = useState<NewCategory>(emptyForm);
  const valid = form.label.trim() !== "" && form.group_name.trim() !== "";
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Add a category</h2>
      <div className={styles.formRow}>
        <input
          className={`${styles.input} ${styles.grow}`}
          placeholder="Name, e.g. Cat food"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <input
          className={styles.input}
          list="category-groups"
          placeholder="Group, e.g. Shopping"
          value={form.group_name}
          onChange={(e) => setForm({ ...form, group_name: e.target.value })}
        />
        <datalist id="category-groups">
          {groups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        <select
          className={styles.select}
          value={form.flow}
          onChange={(e) => setForm({ ...form, flow: e.target.value as NewCategory["flow"] })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <label className={styles.meta}>
          <input
            type="checkbox"
            checked={form.fixed}
            onChange={(e) => setForm({ ...form, fixed: e.target.checked })}
          />{" "}
          Fixed cost
        </label>
      </div>
      <textarea
        className={styles.textarea}
        placeholder="What belongs here? Claude reads this to decide, so be concrete (examples help)."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div>
        <button
          className={styles.button}
          disabled={!valid}
          onClick={() => {
            onAdd(form);
            setForm(emptyForm);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

const RecheckPanel: React.FC<{
  categories: Category[];
  uncategorizedCount: number;
  preview: (s: RecheckScope) => Promise<{ entries: number; batches: number }>;
  start: (s: RecheckScope) => void;
}> = ({ categories, uncategorizedCount, preview, start }) => {
  const [mode, setMode] = useState<"uncategorized" | "selected" | "all">("uncategorized");
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState<{ entries: number; batches: number } | null>(null);

  const scope: RecheckScope = useMemo(
    () =>
      mode === "all"
        ? { from_categories: null, include_uncategorized: true }
        : mode === "selected"
          ? { from_categories: selected, include_uncategorized: true }
          : { from_categories: [], include_uncategorized: true },
    [mode, selected],
  );

  useEffect(() => {
    let cancelled = false;
    preview(scope)
      .then((r) => !cancelled && setCount(r))
      .catch(() => !cancelled && setCount(null));
    return () => {
      cancelled = true;
    };
  }, [scope, preview, uncategorizedCount]);

  const toggle = (key: string) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Re-check existing entries with Claude</h2>
      <span className={styles.meta}>
        After you add, split or delete categories, Claude can move entries that already exist. It
        only changes what clearly fits better, and you see nothing until it is done.
      </span>
      <div className={styles.formRow}>
        {(
          [
            ["uncategorized", `Only entries without a category (${uncategorizedCount})`],
            ["selected", "Entries in these categories"],
            ["all", "Everything"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className={styles.meta}>
            <input type="radio" checked={mode === value} onChange={() => setMode(value)} /> {label}
          </label>
        ))}
      </div>
      {mode === "selected" && (
        <div className={styles.chips}>
          {categories
            .filter((c) => c.items + c.transactions > 0)
            .map((c) => (
              <button
                key={c.key}
                className={`${styles.chip} ${selected.includes(c.key) ? styles.chipOn : ""}`}
                onClick={() => toggle(c.key)}
              >
                {c.label} ({c.items + c.transactions})
              </button>
            ))}
        </div>
      )}
      <div className={styles.formRow}>
        <button
          className={styles.button}
          disabled={!count || count.entries === 0}
          onClick={() => start(scope)}
        >
          {count ? `Check ${count.entries} entries` : "Counting..."}
        </button>
        {count && count.entries > 0 && (
          <span className={styles.meta}>
            {count.batches} batch{count.batches === 1 ? "" : "es"} of up to 100 entries
          </span>
        )}
      </div>
    </div>
  );
};

const CategoryRow: React.FC<{
  category: Category;
  sameFlow: Category[];
  onUpdate: (patch: Partial<Category>) => void;
  onMerge: (into: string) => void;
  onDelete: () => void;
}> = ({ category, sameFlow, onUpdate, onMerge, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(category.label);
  const [group, setGroup] = useState(category.group_name);
  const [description, setDescription] = useState(category.description ?? "");
  const [mergeInto, setMergeInto] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const used = category.items + category.transactions;

  return (
    <div className={`${styles.row} ${category.active ? "" : styles.inactive}`}>
      <div className={styles.rowMain}>
        <span>
          <span className={styles.label}>{category.label}</span>{" "}
          <span className={styles.meta}>
            {category.flow === "income" ? "income" : "expense"}
            {category.fixed ? " · fixed" : ""} · {category.items} items · {category.transactions} bookings
          </span>
        </span>
        <span className={styles.actions}>
          <label className={styles.meta}>
            <input
              type="checkbox"
              checked={category.fixed}
              onChange={(e) => onUpdate({ fixed: e.target.checked })}
            />{" "}
            Fixed
          </label>
          <label className={styles.meta}>
            <input
              type="checkbox"
              checked={category.active}
              onChange={(e) => onUpdate({ active: e.target.checked })}
            />{" "}
            In use
          </label>
          <button className={styles.subtle} onClick={() => setEditing(!editing)}>
            {editing ? "Close" : "Edit"}
          </button>
        </span>
      </div>
      {category.description && !editing && <span className={styles.desc}>{category.description}</span>}

      {editing && (
        <>
          <div className={styles.formRow}>
            <input className={`${styles.input} ${styles.grow}`} value={label} onChange={(e) => setLabel(e.target.value)} />
            <input className={styles.input} value={group} onChange={(e) => setGroup(e.target.value)} />
          </div>
          <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className={styles.actions}>
            <button
              className={styles.button}
              onClick={() => {
                onUpdate({ label, group_name: group, description });
                setEditing(false);
              }}
            >
              Save
            </button>
            <select className={styles.select} value={mergeInto} onChange={(e) => setMergeInto(e.target.value)}>
              <option value="">Merge into...</option>
              {sameFlow
                .filter((c) => c.key !== category.key)
                .map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
            </select>
            <button className={styles.subtle} disabled={!mergeInto} onClick={() => onMerge(mergeInto)}>
              Merge {used} entries
            </button>
            {confirmDelete ? (
              <button className={`${styles.subtle} ${styles.danger}`} onClick={onDelete}>
                Really delete? {used} entries become uncategorized
              </button>
            ) : (
              <button className={`${styles.subtle} ${styles.danger}`} onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const CategoriesPage: React.FC = () => {
  const { categories, uncategorized, loading, error, message, create, update, merge, remove, previewRecheck, recheck } =
    useCategories();

  const groups = useMemo(() => {
    const order: string[] = [];
    categories.forEach((c) => {
      if (!order.includes(c.group_name)) order.push(c.group_name);
    });
    return order;
  }, [categories]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Categories</h1>
      <p className={styles.intro}>
        This list is what receipts and bank statements are sorted into. Change it any time: new
        uploads use it immediately, and Claude can re-check what is already stored.
      </p>

      {error && <div className={`${styles.notice} ${styles.error}`}>{error}</div>}
      {message && <div className={styles.notice}>{message}</div>}

      <RecheckPanel
        categories={categories}
        uncategorizedCount={uncategorized.items + uncategorized.transactions}
        preview={previewRecheck}
        start={recheck}
      />
      <AddCategory groups={groups} onAdd={create} />

      {loading && <div className={styles.notice}>Loading...</div>}

      {groups.map((group) => (
        <div key={group} className={styles.card}>
          <h2 className={styles.groupTitle}>{group}</h2>
          {categories
            .filter((c) => c.group_name === group)
            .map((c) => (
              <CategoryRow
                key={c.key}
                category={c}
                sameFlow={categories.filter((o) => o.flow === c.flow)}
                onUpdate={(patch) => update(c.key, patch)}
                onMerge={(into) => merge(c.key, into)}
                onDelete={() => remove(c.key)}
              />
            ))}
        </div>
      ))}
    </div>
  );
};
