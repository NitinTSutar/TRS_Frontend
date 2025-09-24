import React, { useEffect } from "react";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/userStore";
import { Link } from "react-router-dom";
import Signout from "./Signout";
import MasterNavOptions from "./masterComponents/MasterNavOptions";
import AdminNavOptions from "./adminComponents/AdminNavOptions";
import ManagerNavOptions from "./managerComponents/ManagerNavOptions";
import EmployeeNavOptions from "./employeeComponents/EmployeeNavOptions";

const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useUserStore();

  useEffect(() => {
    const toggleInput = document.querySelector(".theme-controller");
    if (toggleInput) {
      toggleInput.checked = theme === "lofi";
    }
  }, [theme]);

  return (
    <div className="navbar bg-base-200 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-lg">
          {user
            ? user.role === "masterAdmin"
              ? "TECHNOS ASSOCIATES"
              : user.companyName
            : "TECHNOS ASSOCIATIES"}
        </Link>
      </div>
      <div className="flex-none">
        {user?.role === "masterAdmin" && <MasterNavOptions />}
        {user?.role === "admin" && <AdminNavOptions />}
        {user?.role === "manager" && <ManagerNavOptions />}
        {user?.role === "employee" && <EmployeeNavOptions />}
        <label className="toggle text-base-content cursor-pointer">
          <input
            type="checkbox"
            className="theme-controller"
            onChange={toggleTheme}
            checked={theme === "light"}
          />

          <svg
            aria-label="moon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </g>
          </svg>

          <svg
            aria-label="sun"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </g>
          </svg>
        </label>
        {user && (
          <div className="dropdown dropdown-end ml-4">
            <label
              tabIndex={0}
              className="btn btn-outline flex items-center gap-2"
            >
              <span>{user.name.split(" ")[0]}</span>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 gap-2 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52"
            >
              <li>
                <Link to="/settings" className="justify-between">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Signout />
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
