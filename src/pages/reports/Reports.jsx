import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartNoAxesCombined, Download } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import PageHeading from "../../components/common/PageHeading";
import TableSkeleton from "../../components/common/TableSkeleton";

const COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/summary")
      .then((res) => setData(res.data?.data || null))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load report"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><div className="panel"><TableSkeleton /></div></div>;

  const equipmentByStatus = (data?.equipmentByStatus || []).map((x) => ({
    name: String(x._id || "unknown").replace(/_/g, " "),
    value: x.count
  }));
  const ticketsByStatus = (data?.ticketsByStatus || []).map((x) => ({
    name: String(x._id || "unknown").replace(/_/g, " "),
    value: x.count
  }));
  const maintenanceByStatus = (data?.maintenanceByStatus || []).map((x) => ({
    name: String(x._id || "unknown").replace(/_/g, " "),
    count: x.count
  }));

  function downloadCsv() {
    const rows = [["Module", "Status", "Count"]];
    equipmentByStatus.forEach((r) => rows.push(["Equipment", r.name, r.value]));
    ticketsByStatus.forEach((r) => rows.push(["Tickets", r.name, r.value]));
    maintenanceByStatus.forEach((r) => rows.push(["Maintenance", r.name, r.count]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "netops-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-content">
      <PageHeading
        title="Reports and analytics"
        description="Review equipment inventory, maintenance performance and support statistics."
        action={
          <button className="btn btn-primary" onClick={downloadCsv} type="button">
            <Download size={17} /> Export CSV
          </button>
        }
      />

      <div className="stat-card" style={{ marginBottom: 18 }}>
        <p className="stat-title">Total maintenance cost</p>
        <h2>${Number(data?.totalMaintenanceCost || 0).toLocaleString()}</h2>
      </div>

      <div className="report-grid">
        <div className="panel">
          <div className="panel-header"><h3>Equipment by status</h3></div>
          {equipmentByStatus.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 11 }}>No data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={equipmentByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {equipmentByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header"><h3>Tickets by status</h3></div>
          {ticketsByStatus.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 11 }}>No data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={ticketsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {ticketsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header"><h3>Maintenance by status</h3></div>
        {maintenanceByStatus.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 11 }}>No data yet.</p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={maintenanceByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0edf5" />
                <XAxis dataKey="name" fontSize={11} stroke="#aaa6b8" />
                <YAxis fontSize={11} stroke="#aaa6b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
