import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { getManagerTeam } from "../../utils/api";
import useUserStore from "../../store/userStore";

const ManagerTeam = () => {
  const { user } = useUserStore();

  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["managerTeam"],
    queryFn: getManagerTeam,
    enabled: !!user && user.role === "manager",
  });

  // Protected Route
  if (user && user.role !== "manager") {
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

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Team</h1>
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Email</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {team?.map((member) => (
              <tr key={member._id} className="hover">
                <td>{member.name}</td>
                <td>{member.employeeId}</td>
                <td>{member.email}</td>
                <td>{member.phoneNumber}</td>
              </tr>
            ))}
            {team?.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  You have no team members assigned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerTeam;
