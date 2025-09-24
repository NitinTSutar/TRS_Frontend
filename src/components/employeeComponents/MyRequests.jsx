import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { getEmployeeTravelRequests, selectTravelOption } from "../../utils/api";
import useUserStore from "../../store/userStore";
import EmployeeRequestDetailsModal from "./EmployeeRequestDetailsModal";

const MyRequests = () => {
  const { user } = useUserStore();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(
    location.state?.initialTab || "all"
  );
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (location.state?.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location.state]);

  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employeeRequests"],
    queryFn: getEmployeeTravelRequests,
    enabled: !!user,
  });

  const { mutate: selectOptionMutate, isPending: isSelecting } = useMutation({
    mutationFn: selectTravelOption,
    onSuccess: () => {
      toast.success("Option selected! Request sent for manager approval.");
      queryClient.invalidateQueries({ queryKey: ["employeeRequests"] });
      setSelectedRequest(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to select option."),
  });

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (activeTab === "all") return requests;
    const statusMap = {
      pending: ["submitted", "employeeConfirmed", "managerApproved"],
      action: ["optionsSent"],
      completed: ["booked", "managerRejected"],
    };
    return requests.filter((r) => statusMap[activeTab].includes(r.status));
  }, [requests, activeTab]);

  if (!user) return <Navigate to="/login" replace />;
  if (isLoading)
    return (
      <div className="flex-1 flex justify-center items-center">
        <span className="loading loading-lg loading-spinner"></span>
      </div>
    );
  if (error)
    return (
      <div className="flex-1 p-4">
        <div role="alert" className="alert alert-error">
          <span>Error: {error.message}</span>
        </div>
      </div>
    );

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "action", label: "Action Required" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Travel Requests</h1>

      <div role="tablist" className="tabs tabs-boxed mb-6">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            role="tab"
            className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Journey Type</th>
              <th>Travel Date</th>
              <th>Status</th>
              <th>Submitted On</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <tr key={req._id} className="hover">
                <td>{req.journeyType}</td>
                <td>
                  {req.travelDate
                    ? format(new Date(req.travelDate), "PPP")
                    : "N/A"}
                </td>
                <td>
                  <span
                    className={`badge badge-sm capitalize ${
                      req.status === "optionsSent"
                        ? "badge-warning"
                        : "badge-ghost"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td>{format(new Date(req.createdAt), "PPP")}</td>
                <td>
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => setSelectedRequest(req)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No requests in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <EmployeeRequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSelectOption={(optionId) =>
            selectOptionMutate({
              requestId: selectedRequest._id,
              selectedOptionId: optionId,
            })
          }
          isSelecting={isSelecting}
        />
      )}
    </div>
  );
};

export default MyRequests;
