import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMasterDashboardData } from "../../utils/api";
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

  // Add a check for data to prevent crash if data is undefined after loading/error checks
  if (!data) {
    return <div className="p-4">No dashboard data available.</div>;
  }

  return (
    <div className="p-4 space-y-8">
      {/* Stats Cards */}
      <div className="stats shadow w-full">
        <StatCard title="Total Companies" value={data.totalCompanies} />
        <StatCard title="Total Users" value={data.totalUsers} />
        <StatCard title="Total Requests" value={data.totalRequests} />
      </div>

      {/* Recent Companies Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Top Companies by Request Volume
        </h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Company Name</th>
                <th className="text-center">Current Month</th>
                <th className="text-center">Last Month</th>
                <th className="text-center">Total Requests</th>
              </tr>
            </thead>
            <tbody>
              {data.topCompanies.map((company) => (
                <tr
                  key={company.companyId}
                  className="hover cursor-pointer"
                  onClick={() => handleRowClick(company.companyId)}
                >
                  <td>{company.companyName}</td>
                  <td className="text-center">{company.currentMonth}</td>
                  <td className="text-center">{company.lastMonth}</td>
                  <td className="text-center font-bold">
                    {company.totalRequests}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.topCompanies.length === 0 && (
            <p className="text-center p-4">No company data to display.</p>
          )}
        </div>
      </div>

      {/* Recent Travel Requests Table (even if empty) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Travel Requests</h2>
        <div className="overflow-x-auto">
          {data.recentTravelRequests.length > 0 ? (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Company</th>
                  <th>Journey Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTravelRequests.map((req) => (
                  <tr key={req._id} className="hover">
                    <td>{req.requesterId?.name || "N/A"}</td>
                    <td>{req.requesterId?.companyName || "N/A"}</td>
                    <td>{req.journeyType}</td>
                    <td>
                      <span className="badge badge-ghost badge-sm capitalize">
                        {req.status}
                      </span>
                    </td>
                    <td>{format(new Date(req.createdAt), "PPP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center p-4">No recent travel requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterAdminDashboard;
