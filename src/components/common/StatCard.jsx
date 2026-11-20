import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, change, icon: Icon, color = "purple", trend = "up" }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <p className="stat-title">{title}</p>
          <h2>{value}</h2>
        </div>
        {Icon && (
          <div className={`stat-icon ${color}`}>
            <Icon size={21} />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="stat-bottom">
          <span className={`trend trend-${trend}`}>
            {trend === "up" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
            {change}
          </span>
          <span className="muted">vs last month</span>
        </div>
      )}
    </div>
  );
}
