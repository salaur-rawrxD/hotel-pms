import { Construction } from "lucide-react";

export default function PagePlaceholder({
  title,
  subtitle = "This module is coming soon",
  icon: Icon = Construction,
  description,
}) {
  return (
    <div className="space-y-6 pb-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-body">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="empty-state-title">Coming Soon</p>
            <p className="empty-state-desc">
              {description ??
                `The ${title} module is currently being built.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
