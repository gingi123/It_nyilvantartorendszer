import { Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { BsHouse, BsPersonCircle } from "react-icons/bs";
import { useState } from "react";
import useAuth from "../../auth/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Topbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prev) => !prev);

  return (
    <div
      className="bg-white shadow-sm d-flex align-items-center px-4 position-relative" data-testid="topbar-menu"
      style={{ height: 60, zIndex: 2000 }}
    >
      {/* Kezdőlap */}
      <Link
        to={"/dashboard"}
        className="d-flex align-items-center me-4 text-decoration-none text-dark app-btn"
        data-testid="topbar-menu-home"
        title="Kezdőlap"
      >
        <BsHouse className="me-2" size={18} />
        <span>Kezdőlap</span>
      </Link>

      {/* Profil */}
      <Dropdown isOpen={dropdownOpen} toggle={toggle} className="ms-auto">
        <DropdownToggle
          color="link"
          className="p-0 border-0 shadow-none text-dark profile-toggle" data-testid="topbar-menu-profile"
          aria-label="Profil menü"
          title="Profil"
        >
          <BsPersonCircle size={28} />
        </DropdownToggle>

        <DropdownMenu className="profile-menu">
          <DropdownItem className="profile-item" data-testid="topbar-profile-menu-profile" onClick={() => navigate("/profile")}>
            Profil
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem className="logout-item" data-testid="topbar-profile-menu-logout" onClick={logout}>
            Kilépés
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Topbar;