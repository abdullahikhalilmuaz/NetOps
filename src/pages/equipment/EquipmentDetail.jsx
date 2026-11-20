import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Monitor, Wrench, Calendar, User, MapPin, Building, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import Status from "../../components/common/Status";
import PageHeading from "../../components/common/PageHeading";
import TableSkeleton from "../../components/common/TableSkeleton";

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [eqRes, mtRes] = await Promise.allSettled([
          api.get(`/equipment/${id}`),
          api.get("/maintenance", { params: { equipment: id } })
        ]);
        if (!alive) return;
        if (eqRes.status === "fulfilled") {
          setEquipment(eqRes.value.data?.data?.equipment || null);
        }
        if (mtRes.status === "fulfilled") {
          setMaintenance(mtRes.value.data?.data?.items || []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not load equipment");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="page-content"><div className="panel"><TableSkeleton /></div></div>;
  if (!equipment) return (
    <div className="page-content">
      <PageHeading title="Equipment not found" description="This record may have been removed." />
      <Link to="/equipment" className="btn btn-secondary"><ArrowLeft size={16} /> Back to inventory</Link>
    </div>
  );

  return (
    <div className="page-content">
      <div className="detail-header">
        <button className="icon-button" onClick={() => navigate("/equipment")} type="button">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1>{equipment.name}</h1>
          <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>
            {equipment.assetTag} · {equipment.category}
          </p>
        </div>
        <Status value={equipment.status} />
      </div>

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-header"><h3>Equipment information</h3></div>
          <div className="info-grid">
            <InfoRow icon={Monitor} label="Asset tag" value={equipment.assetTag} />
            <InfoRow icon={ShieldCheck} label="Serial" value={equipment.serialNumber || "—"} />
            <InfoRow icon={Building} label="Department" value={equipment.department || "—"} />
            <InfoRow icon={MapPin} label="Location" value={equipment.location || "—"} />
            <InfoRow icon={Monitor} label="Brand / Model" value={[equipment.brand, equipment.model].filter(Boolean).join(" ") || "—"} />
            <InfoRow icon={User} label="Condition" value={equipment.condition || "—"} />
            <InfoRow icon={Calendar} label="Purchased" value={equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : "—"} />
            <InfoRow icon={Calendar} label="Warranty" value={equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString() : "—"} />
          </div>
          {equipment.notes && (
            <>
              <h3 style={{ fontSize: 12, marginTop: 18, marginBottom: 8 }}>Notes</h3>
              <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.7, margin: 0 }}>{equipment.notes}</p>
            </>
          )}
        </div>

        <div className="panel">
          <div className="panel-header"><h3>Assignment</h3></div>
          {equipment.assignedTo ? (
            <div className="assignee-card">
              <div className="profile-avatar">{equipment.assignedTo.name?.charAt(0).toUpperCase() || "?"}</div>
              <div>
                <strong>{equipment.assignedTo.name}</strong>
                <span>{equipment.assignedTo.email}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Not currently assigned to a user.</p>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div>
            <h3>Maintenance history</h3>
            <p>All maintenance tasks recorded for this equipment.</p>
          </div>
        </div>
        {maintenance.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 11 }}>No maintenance tasks have been recorded yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Scheduled</th>
                  <th>Technician</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m._id}>
                    <td><strong>{m.title}</strong></td>
                    <td>{m.type}</td>
                    <td>{m.priority}</td>
                    <td>{m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : "—"}</td>
                    <td>{m.assignedTo?.name || "Unassigned"}</td>
                    <td><Status value={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="info-row">
      <span className="info-icon"><Icon size={15} /></span>
      <div>
        <span className="info-label">{label}</span>
        <strong className="info-value">{value || "—"}</strong>
      </div>
    </div>
  );
}
