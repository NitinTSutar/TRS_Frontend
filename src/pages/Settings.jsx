import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import useUserStore from "../store/userStore";
import { getProfile } from "../utils/api";
import EditProfileModal from "../components/EditProfileModal";

const ProfileDetail = ({ label, value }) => (
  <div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className="mt-1 text-lg">{value}</div>
  </div>
);

const Settings = () => {
  const { user } = useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", user?._id],
    queryFn: () => getProfile(user?.role === "masterAdmin"),
    enabled: !!user, // Only run query if user is logged in
  });

  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
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
          <span>Error fetching profile: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            className="btn btn-primary"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <div className="flex items-center space-x-4">
              <div className="avatar placeholder">
                <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
                  <span className="text-xl">{profile?.name?.charAt(0)}</span>
                </div>
              </div>
              <div>
                <h2 className="card-title text-2xl">{profile?.name}</h2>
                <p className="text-base-content/70 capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProfileDetail label="Email" value={profile?.email} />
              <ProfileDetail
                label="Phone Number"
                value={profile?.phoneNumber}
              />
              {profile?.employeeId && (
                <ProfileDetail label="Employee ID" value={profile.employeeId} />
              )}
              {profile?.companyName && (
                <ProfileDetail label="Company" value={profile.companyName} />
              )}
              {profile?.companyId && (
                <ProfileDetail label="Company ID" value={profile.companyId} />
              )}
              <ProfileDetail
                label="Member Since"
                value={format(
                  new Date(profile?.createdAt || Date.now()),
                  "PPP"
                )}
              />
            </div>
          </div>
        </div>
        {isEditModalOpen && (
          <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default Settings;
