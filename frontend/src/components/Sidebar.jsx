import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Clients", path: "/clients" },
  { name: "Projects", path: "/projects" },
  { name: "Tasks", path: "/tasks" },
  { name: "Team", path: "/team" },
  { name: "Invoices", path: "/invoices" },
  { name: "Payments", path: "/payments" },
  { name: "Documents", path: "/documents" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        CLIENTIFY
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;