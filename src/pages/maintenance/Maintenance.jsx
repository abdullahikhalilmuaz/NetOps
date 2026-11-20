import { useEffect, useState, useCallback } from "react";
import { Plus, Wrench, CalendarDays, Activity, CheckCircle2, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/common/StatCard";
import Status from "../../components/common/Status";
import TableSkeleton from "../../components/common/TableSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";

const TYPES = ["preventive", "corrective", "inspection"];
const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

function emptyForm() {
  return {
    title: "", description: "", equipment: "", type: "preventive", priority: "medium",
    status: "scheduled", scheduledDate: new Date().toISOString().slice(0, 10),
    assignedTo: "", findings: "", actionsTaken: "", cost: 0
  };
}

export default function Maintenance() {
  const { canManage, isTechnician } = useAuth();
  const [items, setItems] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const canCreate = canManage || isTechnician;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/maintenance", { params });
      setItems(res.data?.data?.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load maintenance");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!showForm) return;
    if (equipmentList.length === 0) {
      api.get("/equipment", { params: { limit: 100 } })
        .then((res) => setEquipmentList(res.data?.data?.items || []))
        .catch(() => {});
    }
    if (canManage && technicians.length === 0) {
      api.get("/users", { params: { role: "technician", limit: 100 } })
        .then((res) => setTechnicians(res.data?.data?.items || []))
        .catch(() => {});
    }
  }, [showForm, canManage, equipmentList.length, technicians.length]);

  function openCreate() { setEditing(null); setForm(emptyForm()); setShowForm(true); }
  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title || "", description: item.description || "",
      equipment: item.equipment?._id || item.equipment || "",
      type: item.type || "preventive", priority: item.priority || "medium",
      status: item.status || "scheduled",
      scheduledDate: item.scheduledDate ? item.scheduledDate.slice(0, 10) : "",
      assignedTo: item.assignedTo?._id || item.assignedTo || "",
      findings: item.findings || "", actionsTaken: item.actionsTaken || "",
      cost: item.cost || 0
    });
    setShowForm(true);
  }

  function updateField(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function save(e) {
    e.preventDefault();
    if (!form.title || !form.equipment || !form.scheduledDate) {
      toast.error("Title, equipment and scheduled date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (editing) {
        await api.patch(`/maintenance/${editing._id}`, payload);
        toast.success("Maintenance updated.");
      } else {
        await api.post("/maintenance", payload);
        toast.success("Maintenance scheduled.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <PageHeading
        title="Maintenance management"
        description="Plan preventive maintenance and monitor repair activities."
        action={canCreate && (
          <button className="btn btn-primary" onClick={openCreate} type="button">
            <Plus size={17} /> Schedule task
          </button>
        )}
      />

      <div className="stats-grid compact-stats">
        <StatCard title="Total tasks" value={items.length} change="Records" icon={Wrench} color="purple" />
        <StatCard title="Scheduled" value={items.filter((x) => x.status === "scheduled").length} change="Upcoming" icon={CalendarDays} color="blue" />
        <StatCard title="In progress" value={items.filter((x) => x.status === "in_progress").length} change="Ongoing" icon={Activity} color="orange" />
        <StatCard title="Completed" value={items.filter((x) => x.status === "completed").length} change="Finished" icon={CheckCircle2} color="green" />
      </div>

      <div className="panel">
        <div className="toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <button className="icon-button" onClick={load} type="button" title="Refresh">
            <RefreshCw size={17} />
          </button>
        </div>

        {loading ? <TableSkeleton /> : items.length === 0 ? (
          <EmptyState title="No maintenance records" description="Schedule your first maintenance task." icon={Wrench} />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Equipment</th>
                  <th>Type</th>
                  <th>Technician</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  {canCreate && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m._id}>
                    <td><strong>{m.title}</strong></td>
                    <td>{m.equipment?.name || "—"}</td>
                    <td>{m.type}</td>
                    <td>{m.assignedTo?.name || "Unassigned"}</td>
                    <td>{m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : "—"}</td>
                    <td><Status value={m.status} /></td>
                    {canCreate && (
                      <td style={{ textAlign: "right" }}>
                        <button className="row-action" onClick={() => openEdit(m)} title="Edit">
                          <Edit size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit maintenance task" : "Schedule maintenance"}
        subtitle="Assign a task to an equipment item."
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} type="button" disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={save} type="button" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Schedule"}
            </button>
          </>
        }
      >
        <form className="form-grid" onSubmit={save}>
          <FormField label="Title" required>
            <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
          </FormField>
          <FormField label="Equipment" required>
            <select value={form.equipment} onChange={(e) => updateField("equipment", e.target.value)} required>
              <option value="">Select equipment…</option>
              {equipmentList.map((eq) => <option key={eq._id} value={eq._id}>{eq.name} ({eq.assetTag})</option>)}
            </select>
          </FormField>
          <FormField label="Type">
            <select value={form.type} onChange={(e) => updateField("type", e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={(e) => updateField("priority", e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Scheduled date" required>
            <input type="date" value={form.scheduledDate} onChange={(e) => updateField("scheduledDate", e.target.value)} required />
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </FormField>
          {canManage && (
            <FormField label="Assigned technician">
              <select value={form.assignedTo} onChange={(e) => updateField("assignedTo", e.target.value)}>
                <option value="">Unassigned</option>
                {technicians.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="Cost">
            <input type="number" min="0" value={form.cost} onChange={(e) => updateField("cost", e.target.value)} />
          </FormField>
          <FormField label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} />
          </FormField>
          <FormField label="Findings">
            <textarea rows={3} value={form.findings} onChange={(e) => updateField("findings", e.target.value)} />
          </FormField>
          <FormField label="Actions taken">
            <textarea rows={3} value={form.actionsTaken} onChange={(e) => updateField("actionsTaken", e.target.value)} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
