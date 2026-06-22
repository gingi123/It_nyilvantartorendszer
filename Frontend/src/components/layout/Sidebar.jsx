import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    BsClipboardData,
    BsArrowLeftRight,
    BsPeople,
    BsLaptop,
    BsChevronDoubleLeft,
    BsChevronDoubleRight,
} from "react-icons/bs";
import logo from "../../assets/ienlogo.png";
import logoSmall from "../../assets/ienlogo_s.png";
import "./Sidebar.css";

const Sidebar = () => {
    // manuális összecsukás (desktopon)
    const [collapsedManual, setCollapsedManual] = useState(false);

    // md alatt automatikusan collapsed
    const [isMdDown, setIsMdDown] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)"); // md breakpoint
        const onChange = (e) => setIsMdDown(e.matches);

        setIsMdDown(mq.matches);
        mq.addEventListener("change", onChange);

        return () => {
            mq.removeEventListener("change", onChange);
        };
    }, []);

    const collapsed = useMemo(
        () => isMdDown || collapsedManual,
        [isMdDown, collapsedManual]
    );

    const menuItems = [
        { path: "/devices", icon: <BsLaptop />, label: "Eszközök", testId: "sidebar-menu-devices" },
        { path: "/users", icon: <BsPeople />, label: "Felhasználók", testId: "sidebar-menu-users" },
        { path: "/assignments", icon: <BsArrowLeftRight />, label: "Mozgások", testId: "sidebar-menu-assignments" },
        { path: "/reports", icon: <BsClipboardData />, label: "Riportok", testId: "sidebar-menu-reports" },
    ];

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""} bg-dark text-white`}>
            {/* Logo */}
            <div className="sidebar-logo" data-testid="sidebar-logo">
                <img src={collapsed ? logoSmall : logo} alt="IEN logó"
                    className={collapsed ? "logo-collapsed" : "logo-full"}
                />
            </div>

            {/* Menü elemek */}
            <nav className="sidebar-menu" data-testid="sidebar-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        data-testid={item.testId}
                        title={item.label} // tooltip, icon-only módban
                        className={({ isActive }) =>
                            isActive ? "sidebar-item active" : "sidebar-item"
                        }
                    >
                        <span className="icon">{item.icon}</span>
                        {!collapsed && <span className="label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Menü összecsukás */}
            <button
                type="button"
                className="sidebar-collapse"
                data-testid="sidebar-collapse-button"
                onClick={() => setCollapsedManual((v) => !v)}
                disabled={isMdDown}
                title={isMdDown ? "Kis képernyőn automatikusan összecsukva" : collapsed ? "Megjelenítés" : "Elrejtés"}
            >
                {collapsed ? <BsChevronDoubleRight /> : <BsChevronDoubleLeft />}
                {!collapsed && <span>Elrejtés</span>}
            </button>
        </div>
    );
};

export default Sidebar;