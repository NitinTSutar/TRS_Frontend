import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  getManagerTravelRequests,
  approveRequestByManager,
  rejectRequestByManager,
} from "../../utils/api";
import useUserStore from "../../store/userStore";
import RequestDetailsModal from "./RequestDetailsModal";

const RequestTable = ({ requests, onDetailsClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Travel Date</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((req) => (
              <tr key={req._id} className="hover">
                <td>{req.requesterId?.name || "N/A"}</td>
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
                <td>{format(new Date(req.createdAt), "PPP")}</td>
                <td>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => onDetailsClick(req._id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {paginatedRequests.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No requests found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="join mt-4 flex justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`join-item btn ${
                currentPage === page ? "btn-active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ManagerRequests = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const {
    data: allRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["managerTravelRequests"],
    queryFn: getManagerTravelRequests,
    enabled: !!user && user.role === "manager",
  });

  const approveMutation = useMutation({
    mutationFn: approveRequestByManager,
    onSuccess: () => {
      toast.success("Request approved!");
      queryClient.invalidateQueries({ queryKey: ["managerTravelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["managerDashboard"] });
      // Close modal on success
      setSelectedRequestId(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to approve."),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRequestByManager,
    onSuccess: () => {
      toast.success("Request rejected!");
      queryClient.invalidateQueries({ queryKey: ["managerTravelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["managerDashboard"] });
      // Close modal on success
      setSelectedRequestId(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to reject."),
  });

  const handleReject = (requestId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      rejectMutation.mutate({ requestId, rejectionReason: reason.trim() });
    } else if (reason === "") {
      // Handle case where user enters empty string but doesn't cancel
      toast.error("A reason for rejection is required.");
    }
  };

  const filteredRequests = useMemo(() => {
    if (!allRequests) return [];
    if (activeTab === "all") return allRequests;
    const statusMap = {
      pending: "employeeConfirmed",
      approved: "managerApproved",
      rejected: "managerRejected",
    };
    return allRequests.filter((r) => r.status === statusMap[activeTab]);
  }, [allRequests, activeTab]);

  if (user && user.role !== "manager") return <Navigate to="/" replace />;
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

  const tabs = ["pending", "approved", "rejected", "all"];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Team Travel Requests</h1>

      <div role="tablist" className="tabs tabs-boxed mb-6">
        {tabs.map((tab) => (
          <a
            key={tab}
            role="tab"
            className={`tab capitalize ${
              activeTab === tab ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </a>
        ))}
      </div>

      <div className="bg-base-100 rounded-lg shadow p-6">
        <RequestTable
          requests={filteredRequests}
          onDetailsClick={setSelectedRequestId}
        />
      </div>

      {selectedRequestId && (
        <RequestDetailsModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={handleReject}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      )}
    </div>
  );
};

export default ManagerRequests;
