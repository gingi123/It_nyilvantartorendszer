import useAuth from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import AdminAssignment from "../components/assignment/AdminAssignment";
import UserAssignment from "../components/assignment/UserAssignment";
import ForbiddenPage from "./ForbiddenPage";

const AssignmentPage = () => {

  const { role } = useAuth();

  return (
    <>
      <div className="page" data-testid="assignment-page">
        <header className="page-header">
          <h3 data-testid="assignment-title">Mozgások</h3>
        </header>
        <div className="content-card" data-testid="assignment-content">
          {role === ROLES.ADMIN ? (<AdminAssignment />) : role === ROLES.USER ? (<UserAssignment />) : (<ForbiddenPage />)}
        </div>
      </div>
    </>
  )
}
export default AssignmentPage