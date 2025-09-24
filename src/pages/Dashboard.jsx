import React from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import MasterAdminDashboard from "../components/masterComponents/MasterAdminDashboard";
import AdminDashboard from "../components/adminComponents/AdminDashboard";
import EmployeeDashboard from "../components/employeeComponents/EmployeeDashboard";
import ManagerDashboard from "../components/managerComponents/ManagerDashboard";

const Dashboard = () => {
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "masterAdmin":
      return <MasterAdminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    default:
      return <div>Welcome, {user.name}. Your role is not recognized.</div>;
  }
};

export default Dashboard;
