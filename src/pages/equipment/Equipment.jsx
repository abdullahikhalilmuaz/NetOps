import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, Monitor, CheckCircle2, Wrench, AlertTriangle, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/common/StatCard";
import Status from "../../components/common/Status";
import TableSkeleton from "../../components/common/TableSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const CATEGORIES = ["router", "switch", "server", "laptop", "desktop", "printer", "firewall", "access_point", "cable", "other"];
const STATUSES = ["available", "in_use", "under_maintenance", "retired", "damaged"];
const CONDITIONS = ["excellent", "good", "fair", "poor"];

function emptyForm() {
  return {
    name: "", assetTag: "", serialNumber: "", category: "laptop", brand: "", model: "",
    location: "", department: "", status: "available", condition: "good",
    purchaseDate: "", warrantyExpiry: "", notes: ""
  };
}

export default function Equipment() {
  const { canManage, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/equipment", { params });
      const d = res.data?.data || {};
      setItems(d.items || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load equipment");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name || "", assetTag: item.assetTag || "", serialNumber: item.serialNumber || "",
      category: item.category || "other", brand: item.brand || "", model: item.model || "",
      location: item.location || "", department: item.department || "",
      status: item.status || "available", condition: item.condition || "good",
      purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : "",
      warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.slice(0, 10) : "",
      notes: item.notes || ""
    });
    setShowForm(true);
  }

  function updateField(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function save(e) {
    e.preventDefault();
    if (!form.name || !form.assetTag) { toast.error("Name and asset tag are required."); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.purchaseDate) delete payload.purchaseDate;
      if (!payload.warrantyExpiry) delete payload.warrantyExpiry;

      if (editing) {
        await api.patch(`/equipment/${editing._id}`, payload);
        toast.success("Equipment updated.");
      } else {
        await api.post("/equipment", payload);
        toast.success("Equipment registered.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/equipment/${deleting._id}`);
      toast.success("Equipment deleted.");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  const available = items.filter((i) => i.status === "available").length;
  const inUse = items.filter((i) => i.status === "in_use").length;
  const underMaint = items.filter((i) => i.status === "under_maintenance").length;

  return (
    <div className="page-content">
      <PageHeading
        title="Equipment inventory"
        description="Manage, track and monitor your organization's IT assets."
        action={canManage && (
          <button className="btn btn-primary" onClick={openCreate} type="button">
            <Plus size={17} /> Add equipment
          </button>
        )}
      />

      <div className="stats-grid compact-stats">
        <StatCard title="Total assets" value={total} change="Inventory" icon={Monitor} color="purple" />
        <StatCard title="Available" value={available} change="Ready" icon={CheckCircle2} color="green" />
        <StatCard title="In use" value={inUse} change="Assigned" icon={AlertTriangle} color="blue" />
        <StatCard title="Maintenance" value={underMaint} change="Attention" icon={Wrench} color="orange" />
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <button className="icon-button" onClick={load} type="button" title="Refresh">
            <RefreshCw size={17} />
          </button>
        </div>

        {loading ? <TableSkeleton /> : items.length === 0 ? (
          <EmptyState title="No equipment found" description="Try adjusting your search or filters." icon={Monitor} />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Asset ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="table-name">
                          <div className="table-icon"><Monitor size={18} /></div>
                          <strong>{item.name}</strong>
                        </div>
                      </td>
                      <td>{item.assetTag}</td>
                      <td>{String(item.category).replace(/_/g, " ")}</td>
                      <td>{item.location || "—"}</td>
                      <td>{item.condition || "—"}</td>
                      <td><Status value={item.status} /></td>
                      <td>
                        <div className="row-actions">
                          <button className="row-action" onClick={() => navigate(`/equipment/${item._id}`)} title="View">
                            <Eye size={15} />
                          </button>
                          {canManage && (
                            <button className="row-action" onClick={() => openEdit(item)} title="Edit">
                              <Edit size={15} />
                            </button>
                          )}
                          {isAdmin && (
                            <button className="row-action row-action-danger" onClick={() => setDeleting(item)} title="Delete">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span className="muted">{total} total records</span>
              <Pagination page={page} pages={pages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit equipment" : "Register equipment"}
        subtitle="All fields except name and asset tag are optional."
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} type="button" disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={save} type="button" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Register"}
            </button>
          </>
        }
      >
        <form className="form-grid" onSubmit={save}>
          <FormField label="Name" required>
            <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          </FormField>
          <FormField label="Asset tag" required>
            <input value={form.assetTag} onChange={(e) => updateField("assetTag", e.target.value)} required />
          </FormField>
          <FormField label="Serial number">
            <input value={form.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
          </FormField>
          <FormField label="Category">
            <select value={form.category} onChange={(e) => updateField("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </FormField>
          <FormField label="Brand">
            <input value={form.brand} onChange={(e) => updateField("brand", e.target.value)} />
          </FormField>
          <FormField label="Model">
            <input value={form.model} onChange={(e) => updateField("model", e.target.value)} />
          </FormField>
          <FormField label="Location">
            <input value={form.location} onChange={(e) => updateField("location", e.target.value)} />
          </FormField>
          <FormField label="Department">
            <input value={form.department} onChange={(e) => updateField("department", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </FormField>
          <FormField label="Condition">
            <select value={form.condition} onChange={(e) => updateField("condition", e.target.value)}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Purchase date">
            <input type="date" value={form.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} />
          </FormField>
          <FormField label="Warranty expiry">
            <input type="date" value={form.warrantyExpiry} onChange={(e) => updateField("warrantyExpiry", e.target.value)} />
          </FormField>
          <FormField label="Notes">
            <textarea rows={3} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete equipment?"
        message={`This will permanently remove "${deleting?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
