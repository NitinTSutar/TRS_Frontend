import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateUserByAdmin } from "../../utils/api";
import { getPasswordStrengthError } from "../../utils/validation";

const EditUserModal = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "male",
    role: "employee",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        age: user.age || "",
        gender: user.gender || "male",
        role: user.role || "employee",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateUserByAdmin,
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["companyUsers"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update user.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
      const passwordError = getPasswordStrengthError(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => {
        if (key === "confirmPassword") return false;
        return value !== "" && value !== user[key];
      })
    );

    if (Object.keys(updateData).length === 0) {
      toast.error("No changes detected.");
      return;
    }

    mutate({ userId: user._id, updateData });
  };

  return (
    <dialog id="edit_user_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg">Edit User: {user.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Name"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Email"
            />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Phone Number"
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Age"
            />
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
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>

            <div className="divider md:col-span-2">Reset Password</div>
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder="New Password"
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
                placeholder="Confirm New Password"
              />
              {errors.confirmPassword && (
                <p className="text-error text-xs mt-1">
                  {errors.confirmPassword}
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

export default EditUserModal;
