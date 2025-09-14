import React from "react";
import { Link } from "react-router-dom";

const MasterNavOptions = () => {
  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/companies">Companies</Link>
      </li>
    </ul>
  );
};

export default MasterNavOptions;
