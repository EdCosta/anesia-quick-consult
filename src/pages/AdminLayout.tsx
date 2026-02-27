import { NavLink, Outlet } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/import/procedures', label: 'Procedures' },
  { to: '/admin/import/guidelines', label: 'Guidelines' },
  { to: '/admin/logs', label: 'Import logs' },
];

export default function AdminLayout() {
  return (
    <div className="container max-w-5xl space-y-6 py-6">
      <header className="space-y-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Secure content operations for procedures and guidelines.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
