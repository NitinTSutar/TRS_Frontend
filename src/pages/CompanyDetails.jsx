import React, { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getCompanyDetails } from "../utils/api";
import useUserStore from "../store/userStore";
import EditCompanyModal from "../components/EditCompanyModal";

const DetailCard = ({ title, value }) => (
  <div>
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="mt-1 text-lg font-semibold">{value}</div>
  </div>
);

const CompanyDetails = () => {
  const { companyId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useUserStore();

  const {
    data: details,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companyDetails", companyId],
    queryFn: () => getCompanyDetails(companyId),
    enabled: !!user && user.role === "masterAdmin" && !!companyId,
  });

  // Protected Route: Only masterAdmin can access this page
  if (user && user.role !== "masterAdmin") {
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
        <Link to="/companies" className="btn btn-link mt-4">
          &larr; Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link to="/companies" className="btn btn-link pl-0 mb-4">
            &larr; Back to Companies
          </Link>
          <h1 className="text-3xl font-bold">{details?.companyName}</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Company
        </button>
      </div>

      {/* Company Details Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailCard title="Company ID" value={details?.companyId} />
          <DetailCard
            title="Created At"
            value={format(new Date(details?.createdAt || Date.now()), "PPP")}
          />
          <DetailCard
            title="Subscription Expiry"
            value={format(
              new Date(details?.subscriptionExpiry || Date.now()),
              "PPP"
            )}
          />
          <DetailCard title="Total Users" value={details?.users?.length} />
        </div>
      </div>

      {/* Users Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Employee ID</th>
              </tr>
            </thead>
            <tbody>
              {details?.users?.map((u) => (
                <tr key={u.userId} className="hover">
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td>{u.employeeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <EditCompanyModal
          companyDetails={details}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyDetails;
