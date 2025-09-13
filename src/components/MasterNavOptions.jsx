import React from "react";
import { Link } from "react-router-dom";

const MasterNavOptions = () => {
  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <Link>Companies</Link>
      </li>
      <li>
        <Link>Admins</Link>
      </li>
      <li>
        <Link>Settings</Link>
      </li>
      {/* <li>
        <details>
          <summary>Parent</summary>
          <ul className="bg-base-100 rounded-t-none p-2">
            <li>
              <a>Link 1</a>
            </li>
            <li>
              <a>Link 2</a>
            </li>
          </ul>
        </details>
      </li> */}
    </ul>
  );
};

export default MasterNavOptions;
