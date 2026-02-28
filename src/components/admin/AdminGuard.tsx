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
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
