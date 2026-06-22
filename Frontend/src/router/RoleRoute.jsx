import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function RoleRoute({ allowed }) {
  const { user } = useAuth();

  // ezt általában ProtectedRoute-on belül használod, de legyen stabil:
  if (!user) return <Navigate to="/login" replace />;

  const ok = allowed.includes(user.role);
  return ok ? <Outlet /> : <Navigate to="/forbidden" replace />;
}