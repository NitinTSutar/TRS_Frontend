import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { getEmployeeTravelRequests } from "../../utils/api";
import useUserStore from "../../store/userStore";

const EmployeeDashboard = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employeeRequests"],
    queryFn: getEmployeeTravelRequests,
    enabled: !!user,
  });

  const actionRequiredRequests =
    requests?.filter((r) => r.status === "optionsSent") || [];
  const recentRequests = requests?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <span className="loading loading-lg loading-spinner"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <div role="alert" className="alert alert-error">
          <span>Error: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <Link to="/create-request" className="btn btn-primary">
          Create New Request
        </Link>
      </div>

      {actionRequiredRequests.length > 0 && (
        <div className="card bg-warning text-warning-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Action Required!</h2>
            <p>
              You have {actionRequiredRequests.length} request(s) waiting for
              you to select a travel option.
            </p>
            <div className="card-actions justify-end">
              <button
                onClick={() =>
                  navigate("/my-requests", { state: { initialTab: "action" } })
                }
                className="btn"
              >
                View Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">My Recent Requests</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Journey Type</th>
                  <th>Travel Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req._id} className="hover">
                    <td>{req.journeyType}</td>
                    <td>
                      {req.travelDate
                        ? format(new Date(req.travelDate), "PPP")
                        : "N/A"}
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm capitalize">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
