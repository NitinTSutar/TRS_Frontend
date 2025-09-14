import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMasterDashboardData } from "../utils/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, description, className }) => (
  <div className={`stat place-items-center ${className || ""}`}>
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {description && <div className="stat-desc">{description}</div>}
  </div>
);

const MasterAdminDashboard = () => {
    const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["masterDashboard"],
    queryFn: getMasterDashboardData,
  });

  const handleRowClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-lg loading-spinner"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {/* Stats Cards */}
      <div className="stats shadow w-full">
        <StatCard title="Total Companies" value={data.totalCompanies} />
        <StatCard title="Total Users" value={data.totalUsers} />
        <StatCard
          title="Active Subscriptions"
          value={data.activeSubscriptions}
        />
        <StatCard
          title="Expired Subscriptions"
          value={data.expiredSubscriptions}
          className={
            data.expiredSubscriptions > 0 ? "bg-error text-error-content" : ""
          }
        />
      </div>

      {/* Recent Companies Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Companies</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Subscription Expiry</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCompanies.map((company) => (
                <tr
                  key={company._id}
                  className="hover cursor-pointer"
                  onClick={() => handleRowClick(company.companyId)}
                >
                  <td>{company.companyName}</td>
                  <td>{format(new Date(company.subscriptionExpiry), "PPP")}</td>
                  <td>{format(new Date(company.createdAt), "PPP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.recentCompanies.length === 0 && (
            <p className="text-center p-4">No recent companies to display.</p>
          )}
        </div>
      </div>

      {/* Recent Travel Requests Table (even if empty) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Travel Requests</h2>
        <div className="overflow-x-auto">
          {data.recentTravelRequests.length > 0 ? (
            <p>Travel requests table would go here.</p> // Placeholder for when you have data
          ) : (
            <p className="text-center p-4">No recent travel requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterAdminDashboard;
