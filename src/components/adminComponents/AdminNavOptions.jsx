import React from "react";
import { NavLink } from "react-router-dom";

const AdminNavOptions = () => {
  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <NavLink to="/">Dashboard</NavLink>
      </li>
      <li>
        <NavLink to="/travel-requests">All Travel Requests</NavLink>
      </li>
      <li>
        <NavLink to="/users">Manage Users</NavLink>
        </li>
    </ul>
  );
};

export default AdminNavOptions;
