/**
 * RequireAuth component - guards admin routes.
 * Redirects unauthenticated users to login page.
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from './session';
import { UserRole } from '../../domain/contracts';
import { Permission, hasPermission } from './permissions';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
}

export function RequireAuth({
  children,
  allowedRoles,
  requiredPermission,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading, user } = useSession();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Проверка аутентификации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (requiredPermission && user && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
