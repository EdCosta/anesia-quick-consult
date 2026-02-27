import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function AdminGuard() {
  const location = useLocation();
  const { isAdmin, isAuthenticated, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="container max-w-3xl py-6">
        <p className="text-sm text-muted-foreground">Loading admin access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-3xl space-y-4 py-6">
        <div className="rounded-lg border bg-card p-4">
          <h1 className="font-heading text-xl font-bold text-foreground">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to authenticated administrators.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
