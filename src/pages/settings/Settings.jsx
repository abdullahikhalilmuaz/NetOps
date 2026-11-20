import { useState } from "react";
import { Save, User, Lock, Bell } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import PageHeading from "../../components/common/PageHeading";
import FormField from "../../components/common/FormField";

export default function Settings() {
  const { user, setUser, isAdmin } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || ""
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function save(e) {
    e.preventDefault();
    if (!user?._id) return;
    setSaving(true);
    try {
      const res = await api.patch(`/users/${user._id}`, form);
      const updated = res.data?.data?.user;
      if (updated) setUser(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <PageHeading title="Settings" description="Manage your profile and workspace preferences." />

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3><User size={15} style={{ display: "inline", marginRight: 6 }} /> Profile</h3>
              <p>Update your personal information.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={save}>
            <FormField label="Full name">
              <input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input value={user?.email || ""} disabled />
            </FormField>
            <FormField label="Phone">
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </FormField>
            <FormField label="Department">
              <input value={form.department} onChange={(e) => update("department", e.target.value)} />
            </FormField>
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3><Lock size={15} style={{ display: "inline", marginRight: 6 }} /> Password</h3>
              <p>Contact an administrator to reset your password.</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            Password change and reset flows will be connected once the backend endpoint is added.
            Your account role is <strong>{String(user?.role || "staff").replace(/_/g, " ")}</strong>.
          </p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3><Bell size={15} style={{ display: "inline", marginRight: 6 }} /> Notifications</h3>
              <p>In-app notifications are always enabled for now.</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            Email notification preferences will be configurable once the notification service is extended.
          </p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div><h3>Workspace</h3><p>Application information.</p></div>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            <strong>NetOps Operations Management</strong><br />
            Version 1.0 · {isAdmin ? "Administrator" : "Standard"} access
          </p>
        </div>
      </div>
    </div>
  );
}
