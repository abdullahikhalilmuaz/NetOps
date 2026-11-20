import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Headset, AlertTriangle, Clock, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/common/StatCard";
import Status from "../../components/common/Status";
import TableSkeleton from "../../components/common/TableSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";

const CATEGORIES = ["network", "hardware", "software", "account", "other"];
const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["open", "in_progress", "waiting_user", "resolved", "closed"];

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "hardware", priority: "medium" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/tickets", { params });
      setTickets(res.data?.data?.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  function updateField(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.subject || !form.description) { toast.error("Subject and description are required."); return; }
    setSaving(true);
    try {
      await api.post("/tickets", form);
      toast.success("Ticket submitted.");
      setShowForm(false);
      setForm({ subject: "", description: "", category: "hardware", priority: "medium" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit ticket");
    } finally {
      setSaving(false);
    }
  }

  const filtered = tickets.filter((t) =>
    !search || [t.subject, t.ticketNumber, t.requester?.name].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <PageHeading
        title="Support tickets"
        description="Track technical issues, requests and support activities."
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)} type="button">
            <Plus size={17} /> New ticket
          </button>
        }
      />

      <div className="stats-grid compact-stats">
        <StatCard title="All tickets" value={tickets.length} change="Total" icon={Headset} color="purple" />
        <StatCard title="Open" value={tickets.filter((t) => t.status === "open").length} change="Awaiting" icon={AlertTriangle} color="orange" />
        <StatCard title="In progress" value={tickets.filter((t) => t.status === "in_progress").length} change="Being handled" icon={Clock} color="blue" />
        <StatCard title="Resolved" value={tickets.filter((t) => t.status === "resolved").length} change="Completed" icon={CheckCircle2} color="green" />
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {loading ? <TableSkeleton /> : filtered.length === 0 ? (
          <EmptyState title="No tickets" description="When tickets are submitted they'll show up here." icon={Headset} />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Requester</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="table-name">
                        <div className="table-icon orange"><Headset size={17} /></div>
                        <strong>{t.subject}</strong>
                      </div>
                    </td>
                    <td>{t.requester?.name || "Staff"}</td>
                    <td>{t.category}</td>
                    <td><Status value={t.priority} /></td>
                    <td><Status value={t.status} /></td>
                    <td style={{ textAlign: "right" }}>
                      <Link to={`/tickets/${t._id}`} className="row-action" title="View">
                        <Eye size={15} />
                      </Link>
                    </td>
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
        title="New support ticket"
        subtitle="Describe your issue and we'll respond as soon as possible."
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} type="button" disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} type="button" disabled={saving}>
              {saving ? "Submitting..." : "Submit ticket"}
            </button>
          </>
        }
      >
        <form className="form-grid" onSubmit={submit}>
          <FormField label="Subject" required>
            <input value={form.subject} onChange={(e) => updateField("subject", e.target.value)} required />
          </FormField>
          <FormField label="Category">
            <select value={form.category} onChange={(e) => updateField("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={(e) => updateField("priority", e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Description" required>
            <textarea rows={5} value={form.description} onChange={(e) => updateField("description", e.target.value)} required />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
