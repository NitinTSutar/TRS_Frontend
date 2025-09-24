import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { format, subMonths } from "date-fns";
import { getCompanies } from "../utils/api";
import useUserStore from "../store/userStore";
import CreateCompanyModal from "../components/masterComponents/CreateCompanyModal";

const Companies = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: companies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    // Only run this query if the user is a masterAdmin
    enabled: !!user && user.role === "masterAdmin",
  });

  const handleRowClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

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
      </div>
    );
  }

  const now = new Date();
  const currentMonthName = format(now, "MMMM");
  const lastMonthName = format(subMonths(now, 1), "MMMM");
  const twoMonthsAgoName = format(subMonths(now, 2), "MMMM");

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registered Companies</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Company
        </button>
      </div>
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Company Name</th>
              <th className="text-center">{currentMonthName} Requests</th>
              <th className="text-center">{lastMonthName} Requests</th>
              <th className="text-center">{twoMonthsAgoName} Requests</th>
              <th className="text-center">Total Requests</th>
            </tr>
          </thead>
          <tbody>
            {companies?.map((company, index) => (
              <tr
                key={company.companyId}
                className="hover cursor-pointer"
                onClick={() => handleRowClick(company.companyId)}
              >
                <th>{index + 1}</th>
                <td>{company.companyName}</td>
                <td className="text-center">{company.currentMonthRequests}</td>
                <td className="text-center">{company.lastMonthRequests}</td>
                <td className="text-center">{company.twoMonthsAgoRequests}</td>
                <td className="text-center font-bold">
                  {company.totalRequests}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies?.length === 0 && (
          <p className="text-center p-4">
            No companies have been registered yet.
          </p>
        )}
      </div>
      {isCreateModalOpen && (
        <CreateCompanyModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default Companies;
