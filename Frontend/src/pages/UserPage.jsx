import useAuth from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import AdminUser from "../components/user/AdminUser";
import UserUser from "../components/user/UserUser";
import ForbiddenPage from "./ForbiddenPage";

const UserPage = () => {

  const { role } = useAuth();

  return (
    <>
      <div className="page" data-testid="user-page">
        <header className="page-header">
          <h3 data-testid="user-page-title">Felhasználók</h3>
        </header>
        <div className="content-card" data-testid="user-content">
          {role === ROLES.ADMIN ? (<AdminUser />) : role === ROLES.USER ? (<UserUser />) : (<ForbiddenPage />)}
        </div>
      </div>
    </>
  )
}
export default UserPage