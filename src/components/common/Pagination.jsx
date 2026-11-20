import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  const list = [];
  const from = Math.max(1, page - 1);
  const to = Math.min(pages, page + 1);
  if (from > 1) list.push(1);
  if (from > 2) list.push("…");
  for (let i = from; i <= to; i++) list.push(i);
  if (to < pages - 1) list.push("…");
  if (to < pages) list.push(pages);

  return (
    <div className="pagination">
      <button type="button" className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft size={14} />
      </button>
      {list.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="pagination-dots">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pagination-btn ${p === page ? "pagination-active" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button type="button" className="pagination-btn" onClick={() => onChange(page + 1)} disabled={page >= pages}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
