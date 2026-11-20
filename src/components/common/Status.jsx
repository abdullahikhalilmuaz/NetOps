export default function Status({ value }) {
  const raw = String(value || "").replace(/_/g, " ");
  const normalized = raw.toLowerCase();

  let type = "neutral";
  if (["active", "completed", "resolved", "good", "excellent", "available", "closed"].includes(normalized)) type = "success";
  if (["open", "maintenance", "high", "critical", "poor", "damaged", "retired", "lost"].includes(normalized)) type = "danger";
  if (["in progress", "scheduled", "medium", "fair", "in use", "assigned", "under maintenance", "waiting user", "pending"].includes(normalized)) type = "warning";

  return (
    <span className={`status status-${type}`}>
      <span className="status-dot" />
      {raw || "—"}
    </span>
  );
}
