import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardData } from "../../utils/api";
import { format, subMonths } from "date-fns";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, description }) => (
  <div className="stat place-items-center">
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {description && <div className="stat-desc">{description}</div>}
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-lg loading-spinner"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-error m-4">
        <span>Error: {error.message}</span>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4">No dashboard data available.</div>;
  }

  const now = new Date();
  const currentMonthName = format(now, "MMMM");
  const lastMonthName = format(subMonths(now, 1), "MMMM");

  return (
    <div className="p-4 space-y-8 bg-base-200">
      <div className="stats shadow w-full">
        <Link to="/users" className="stat-link-wrapper">
          <StatCard title="Total Users" value={data.totalUsers} />
        </Link>

        <StatCard title="Total Requests" value={data.totalRequests} />
        <StatCard
          title={`${currentMonthName} Requests`}
          value={data.currentMonthRequests}
        />
        <StatCard
          title={`${lastMonthName} Requests`}
          value={data.lastMonthRequests}
        />
      </div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Pending Actions</h2>
          <p className="text-sm text-base-content/70">
            Travel requests that require your attention.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Link
              to="/travel-requests"
              state={{ initialTab: "submitted" }}
              className="stat-link-wrapper"
            >
              <StatCard
                title="New Requests (Awaiting Options)"
                value={data.pendingActions?.submitted || 0}
              />
            </Link>
            <Link
              to="/travel-requests"
              state={{ initialTab: "approved" }}
              className="stat-link-wrapper"
            >
              <StatCard
                title="Approved Requests (Awaiting Booking)"
                value={data.pendingActions?.managerApproved || 0}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
