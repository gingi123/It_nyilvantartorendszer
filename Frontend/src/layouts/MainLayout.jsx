import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const MainLayout = () => {
  return (
    <div className="main-layout d-flex">
      {/* Oldal menü */}
      <aside className="layout-sidebar">
        <Sidebar />
      </aside>
      {/* Felső menü és tartalom */}
      <div className="main-right flex-grow-1 d-flex flex-column">
        <header>
          <Topbar />
        </header>

        <main className="main-content p-4 bg-light app-content">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;