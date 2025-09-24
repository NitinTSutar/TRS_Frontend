import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  getManagerDashboardData,
  approveRequestByManager,
  rejectRequestByManager,
} from "../../utils/api";

const StatCard = ({ title, value }) => (
  <div className="stat place-items-center bg-base-100 rounded-lg">
    <div className="stat-title">{title}</div>
    <div className="stat-value text-primary">{value}</div>
  </div>
);

const ManagerDashboard = () => {
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["managerDashboard"],
    queryFn: getManagerDashboardData,
  });

  const approveMutation = useMutation({
    mutationFn: approveRequestByManager,
    onSuccess: () => {
      toast.success("Request approved!");
      queryClient.invalidateQueries({ queryKey: ["managerDashboard"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to approve.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRequestByManager,
    onSuccess: () => {
      toast.success("Request rejected!");
      queryClient.invalidateQueries({ queryKey: ["managerDashboard"] });
      setRejectingRequestId(null);
      setRejectionReason("");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to reject.");
    },
  });

  const handleRejectClick = (requestId) => {
    setRejectingRequestId(requestId);
    document.getElementById("rejection_modal").showModal();
  };

  const handleConfirmReject = () => {
    if (!rejectionReason) {
      toast.error("Rejection reason is required.");
      return;
    }
    rejectMutation.mutate({ requestId: rejectingRequestId, rejectionReason });
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
      <div role="alert" className="alert alert-error m-4">
        <span>Error: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Manager Dashboard</h1>

      <div className="stats shadow">
        <StatCard
          title="Pending Approvals"
          value={data?.pendingApprovalCount || 0}
        />
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Pending Requests</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Travel Date</th>
                  <th>Submitted On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentPendingRequests.map((req) => (
                  <tr key={req._id} className="hover">
                    <td>{req.requesterId.name}</td>
                    <td>
                      {req.travelDate
                        ? format(new Date(req.travelDate), "PPP")
                        : "N/A"}
                    </td>
                    <td>{format(new Date(req.createdAt), "PPP")}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => approveMutation.mutate(req._id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleRejectClick(req._id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.recentPendingRequests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No pending requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <dialog id="rejection_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Rejection</h3>
          <p className="py-4">
            Please provide a reason for rejecting this request.
          </p>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          ></textarea>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
            <button
              className="btn btn-error"
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Confirm Reject"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ManagerDashboard;
