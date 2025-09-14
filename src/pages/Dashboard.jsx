import React from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import MasterAdminDashboard from "../components/MasterAdminDashboard";

const Dashboard = () => {
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "masterAdmin":
      return <MasterAdminDashboard />;
    case "admin":
      return <div>Admin Dashboard for {user.name}</div>; // Placeholder
    case "manager":
      return <div>Manager Dashboard for {user.name}</div>; // Placeholder
    case "employee":
      return <div>Employee Dashboard for {user.name}</div>; // Placeholder
    default:
      return <div>Welcome, {user.name}. Your role is not recognized.</div>;
  }
};

export default Dashboard;
