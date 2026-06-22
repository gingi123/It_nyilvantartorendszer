import useAuth from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import AdminReport from "../components/report/AdminReport";
import UserReport from "../components/report/UserReport";
import ForbiddenPage from "./ForbiddenPage";

const ReportPage = () => {

  const { role } = useAuth();

  return (
    <>
      <div className="page" data-testid="report-page">
        <header className="page-header">
          <h3 data-testid="riport-page-title">Riportok</h3>
        </header>
        <div className="content-card" data-testid="report-content">
          {role === ROLES.ADMIN ? (<AdminReport />) : role === ROLES.USER ? (<UserReport />) : (<ForbiddenPage />)}
        </div>
      </div>
    </>
  )
}
export default ReportPage