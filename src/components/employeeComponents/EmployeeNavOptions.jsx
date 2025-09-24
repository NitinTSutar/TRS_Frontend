import React from 'react';
import { NavLink } from "react-router-dom";

const EmployeeNavOptions = () => {
  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <NavLink to="/">Dashboard</NavLink>
      </li>
      <li>
        <NavLink to="/my-requests">My Requests</NavLink>
      </li>
    </ul>
  );
};

export default EmployeeNavOptions;
