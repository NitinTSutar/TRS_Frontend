import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { getCompanyUsers } from "../../utils/api";
import useUserStore from "../../store/userStore";
import EditUserModal from "./EditUserModal";

const ManageUsers = () => {
  const { user } = useUserStore();
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companyUsers"],
    queryFn: getCompanyUsers,
    enabled: !!user && user.role === "admin",
  });

  // Protected Route
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

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Employee ID</th>
              <th>Joined On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u._id} className="hover">
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge badge-ghost badge-sm capitalize">
                    {u.role}
                  </span>
                </td>
                <td>{u.employeeId}</td>
                <td>{format(new Date(u.createdAt), "PPP")}</td>
                <td>
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => setSelectedUser(u)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No users found in this company.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default ManageUsers;
