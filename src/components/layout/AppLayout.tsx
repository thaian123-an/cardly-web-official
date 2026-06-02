import {
  Bell,
  Home,
  LogOut,
  Menu,
  ScanLine,
  Search,
  Settings,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authStore } from "../../features/auth/stores/AuthStore";
import "./layout.css";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/home",
    icon: Home,
  },
  {
    label: "Contacts",
    path: "/contacts",
    icon: UsersRound,
  },
  {
    label: "Scan & Upload",
    path: "/scan-upload",
    icon: ScanLine,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export const AppLayout = observer(() => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userName = authStore.user?.full_name || "Cardly User";
  const userEmail = authStore.user?.email || "user@cardly.com";

  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU";

  const handleLogout = async () => {
    await authStore.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="app-sidebar__header">
          <button
            type="button"
            className="app-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>

          <div className="app-logo">
            <span className="app-logo__mark">C</span>
            <span>Cardly</span>
          </div>
        </div>

        <nav className="app-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `app-nav__link ${isActive ? "is-active" : ""}`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button type="button" className="app-logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="app-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="app-search">
            <Search size={19} />
            <input placeholder="Search contacts, companies..." />
          </div>

          <div className="app-topbar__actions">
            <button type="button" className="app-icon-button">
              <Bell size={20} />
            </button>

            <button
              type="button"
              className="app-profile-button"
              onClick={() => navigate("/digital-card")}
            >
              <span className="app-avatar">{userInitials}</span>

              <span className="app-profile-button__text">
                <strong>{userName}</strong>
                <small>{userEmail}</small>
              </span>

              <UserRound size={18} />
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen ? (
        <button
          type="button"
          className="app-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      ) : null}
    </div>
  );
});