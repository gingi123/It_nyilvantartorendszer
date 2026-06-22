import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function ProtectedRoute() {
  const { isAuthed } = useAuth();
  return isAuthed ? <Outlet /> : <Navigate to="/" replace />;
}