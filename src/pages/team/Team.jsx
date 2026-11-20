import { useEffect, useState } from "react";
import { Users, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import PageHeading from "../../components/common/PageHeading";
import Status from "../../components/common/Status";
import TableSkeleton from "../../components/common/TableSkeleton";
import EmptyState from "../../components/common/EmptyState";

const ROLES = ["admin", "it_manager", "technician", "staff"];

export default function Team() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get("/users", { params });
      setUsers(res.data?.data?.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [roleFilter]);

  return (
    <div className="page-content">
      <PageHeading
        title="Team management"
        description="View administrators, managers, technicians and staff accounts."
      />

      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
          </select>
          <button className="icon-button" onClick={load} type="button" title="Refresh"><RefreshCw size={17} /></button>
        </div>

        {loading ? <TableSkeleton /> : users.length === 0 ? (
          <EmptyState title="No team members" description="Users will appear here once they register." icon={Users} />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="table-name">
                        <div className="table-icon purple">{u.name?.charAt(0).toUpperCase() || "?"}</div>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><Status value={u.role} /></td>
                    <td>{u.department || "—"}</td>
                    <td><Status value={u.isActive ? "active" : "inactive"} /></td>
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
