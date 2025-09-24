import React from "react";
import { NavLink } from "react-router-dom";

const ManagerNavOptions = () => {
  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <NavLink to="/">Dashboard</NavLink>
      </li>
      <li>
        <NavLink to="/team-requests">Team Requests</NavLink>
      </li>
      <li>
        <NavLink to="/my-team">My Team</NavLink>
      </li>
    </ul>
  );
};

export default ManagerNavOptions;
