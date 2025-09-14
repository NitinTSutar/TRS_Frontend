import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateProfile } from "../utils/api";
import useUserStore from "../store/userStore";
import { getPasswordStrengthError } from "../utils/validation";

const EditProfileModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { user, setUser } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        age: user.age || "",
        gender: user.gender || "male",
      }));
    }
  }, [user]);

  const { mutate, isPending } = useMutation({
    mutationFn: (updateData) =>
      updateProfile(updateData, user.role === "masterAdmin"),
    onSuccess: (updatedData) => {
      toast.success("Profile updated successfully!");
      // Optimistically update the user in the store if name or email changed
      if (updatedData.name || updatedData.email) {
        setUser({ ...user, ...updatedData });
      }
      queryClient.invalidateQueries({ queryKey: ["profile", user._id] });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update profile."
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = "New passwords do not match.";
      }
      const passwordError = getPasswordStrengthError(formData.newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword =
          "Current password is required to change it.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Only send fields that have a value
    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => {
        // Don't send confirmNewPassword to backend
        if (key === "confirmNewPassword") return false;
        // Only send non-empty values
        return value !== "";
      })
    );

    mutate(updateData);
  };

  const isMasterAdmin = user.role === "masterAdmin";

  return (
    <dialog id="edit_profile_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg">Edit Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            {!isMasterAdmin && (
              <>
                <div>
                  <label className="label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
            <div className="divider md:col-span-2">Change Password</div>
            <div className="md:col-span-2">
              <label className="label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.currentPassword ? "input-error" : ""
                }`}
                placeholder="Required to change password"
              />
              {errors.currentPassword && (
                <p className="text-error text-xs mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.newPassword ? "input-error" : ""
                }`}
                placeholder="Leave blank to keep same"
              />
              {errors.newPassword && (
                <p className="text-error text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.confirmNewPassword ? "input-error" : ""
                }`}
              />
              {errors.confirmNewPassword && (
                <p className="text-error text-xs mt-1">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default EditProfileModal;
