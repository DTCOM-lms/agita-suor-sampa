import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

