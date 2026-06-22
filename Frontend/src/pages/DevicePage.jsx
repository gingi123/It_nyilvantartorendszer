import useAuth from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import AdminDevice from "../components/device/AdminDevice";
import UserDevice from "../components/device/UserDevice";
import ForbiddenPage from "./ForbiddenPage";

const DevicePage = () => {

  const { role } = useAuth();

  return (
    <>
      <div className="page" data-testid="device-page">
        <header className="page-header">
          <h3 data-testid="device-page-title">Eszközök</h3>
        </header>
        <div className="content-card" data-testid="device-content">
          {role === ROLES.ADMIN ? (<AdminDevice />) : role === ROLES.USER ? (<UserDevice />) : (<ForbiddenPage />)}
        </div>
      </div>
    </>
  )
}
export default DevicePage