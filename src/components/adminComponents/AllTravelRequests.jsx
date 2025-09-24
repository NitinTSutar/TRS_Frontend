import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { getAdminTravelRequests } from "../../utils/api";
import useUserStore from "../../store/userStore";

const TabButton = ({ isActive, count, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-3 font-medium transition-colors
      ${
        isActive
          ? "text-primary border-b-2 border-primary"
          : "text-base-content/60 hover:text-base-content"
      }`}
  >
    {children}
    {count > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error flex items-center justify-center text-xs text-white">
        {count}
      </span>
    )}
  </button>
);

const RequestTable = ({ requests, headers, renderRow }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50">
              {headers.map((header) => (
                <th key={header} className="font-medium text-base-content/60">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((req) => renderRow(req))}
            {paginatedRequests.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="text-center py-8 text-base-content/60"
                >
                  No requests found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`btn btn-sm ${
                currentPage === page ? "btn-primary" : "btn-ghost"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AllTravelRequests = () => {
  const location = useLocation();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState(
    location.state?.initialTab || "submitted"
  );

  useEffect(() => {
    // Allows dashboard links to change the tab
    if (location.state?.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location.state]);

  const {
    data: allRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminTravelRequests"],
    queryFn: getAdminTravelRequests,
    enabled: !!user && user.role === "admin",
  });

  const filteredRequests = useMemo(() => {
    if (!allRequests)
      return { submitted: [], approved: [], booked: [], rejected: [] };
    return {
      submitted: allRequests.filter((r) => r.status === "submitted"),
      approved: allRequests.filter((r) => r.status === "managerApproved"),
      booked: allRequests.filter((r) => r.status === "booked"),
    };
  }, [allRequests]);

  if (user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

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

  const renderSharedRow = (req) => (
    <tr key={req._id} className="hover">
      <td>{req.requesterId?.name || "N/A"}</td>
      <td>{req.journeyType}</td>
      <td>
        {req.travelDate ? format(new Date(req.travelDate), "PPP") : "N/A"}
      </td>
      <td>{format(new Date(req.createdAt), "PPP")}</td>
    </tr>
  );

  const renderBookedRow = (req) => (
    <tr key={req._id} className="hover">
      <td>{req.requesterId?.name || "N/A"}</td>
      <td>{req.journeyType}</td>
      <td>
        {req.travelDate ? format(new Date(req.travelDate), "PPP") : "N/A"}
      </td>
      <td>{req.booking?.bookedBy?.name || "N/A"}</td>
      <td>{format(new Date(req.booking.bookingDate), "PPP")}</td>
    </tr>
  );

  const sharedHeaders = ["Requester", "Journey Type", "Travel Date", "Created"];
  const bookedHeaders = [
    "Requester",
    "Journey Type",
    "Travel Date",
    "Booked By",
    "Booked On",
  ];

  return (
    <div className="flex-1 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-base-content">
            All Travel Requests
          </h1>
          <div className="flex gap-2">{/* Add any action buttons here */}</div>
        </div>

        <div className="bg-base-200 rounded-xl shadow-sm">
          {/* Tabs Navigation */}
          <div className="flex border-b border-base-300">
            <TabButton
              isActive={activeTab === "submitted"}
              count={filteredRequests.submitted.length}
              onClick={() => setActiveTab("submitted")}
            >
              Submitted
            </TabButton>
            <TabButton
              isActive={activeTab === "approved"}
              count={filteredRequests.approved.length}
              onClick={() => setActiveTab("approved")}
            >
              Awaiting Booking
            </TabButton>
            <TabButton
              isActive={activeTab === "booked"}
              count={filteredRequests.booked.length}
              onClick={() => setActiveTab("booked")}
            >
              Booked
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "submitted" && (
              <RequestTable
                requests={filteredRequests.submitted}
                headers={sharedHeaders}
                renderRow={renderSharedRow}
              />
            )}
            {activeTab === "approved" && (
              <RequestTable
                requests={filteredRequests.approved}
                headers={sharedHeaders}
                renderRow={renderSharedRow}
              />
            )}
            {activeTab === "booked" && (
              <RequestTable
                requests={filteredRequests.booked}
                headers={bookedHeaders}
                renderRow={renderBookedRow}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTravelRequests;
