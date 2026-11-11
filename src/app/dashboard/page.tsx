import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="dashboard-overview">
      <header className="dashboard-page-header">
        <div>
          <p className="dashboard-eyebrow">Workspace</p>
          <h1>Overview</h1>
          <p className="dashboard-page-description">
            Manage your forms and keep your work organized.
          </p>
        </div>
      </header>

      <section className="dashboard-overview-grid" aria-label="Workspace sections">
        <Link href="/dashboard/forms" className="dashboard-overview-card">
          <span className="dashboard-card-icon" aria-hidden="true">
            ▤
          </span>
          <span className="dashboard-card-kicker">Workspace</span>
          <strong>Forms</strong>
          <span className="dashboard-card-description">
            Create, edit, and publish forms.
          </span>
          <span className="dashboard-card-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </div>
  );
}
