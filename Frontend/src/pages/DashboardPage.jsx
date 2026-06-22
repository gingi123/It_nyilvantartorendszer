import useAuth from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import UserDashboard from "../components/dashboard/UserDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import ForbiddenPage from "./ForbiddenPage";

const DashboardPage = () => {
  const { role } = useAuth();

  return (
    <>
      <div className="page" data-testid="dashboard-page">
        <header className="page-header">
          <h3 data-testid="dashboard-title">Dashboard</h3>
        </header>
        <div className="content-card" data-testid="dashboard-content">
          {role === ROLES.ADMIN ? (<AdminDashboard />) : role === ROLES.USER ? (<UserDashboard/>) : (<ForbiddenPage/>)}
        </div>
      </div>
    </>
  )
}
export default DashboardPage