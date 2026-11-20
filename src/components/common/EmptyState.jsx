import { Package } from "lucide-react";

export default function EmptyState({ title, description, icon: Icon = Package }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={27} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
