import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createCompany } from "../utils/api";
import { validateEmail, getPasswordStrengthError } from "../utils/validation";

const CreateCompanyModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    employeeId: "",
    phoneNumber: "",
    age: "",
    gender: "male",
    subscriptionDays: 30,
  });
  const [errors, setErrors] = useState({});

  const { mutate, isPending } = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      toast.success("Company created successfully!");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["masterDashboard"] });
      setErrors({});
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create company."
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required.";
    if (!formData.subscriptionDays || formData.subscriptionDays <= 0)
      newErrors.subscriptionDays = "Subscription must be a positive number.";
    if (!formData.name.trim()) newErrors.name = "Admin name is required.";
    if (!formData.employeeId.trim())
      newErrors.employeeId = "Employee ID is required.";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.age || formData.age <= 0)
      newErrors.age = "Age must be a positive number.";

    if (!formData.email) newErrors.email = "Email is required.";
    else if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email address.";

    const passwordError = getPasswordStrengthError(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    mutate(formData);
  };

  return (
    <dialog id="create_company_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg">Create New Company</h3>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Fields */}
            <div>
              <label className="label">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.companyName ? "input-error" : ""
                }`}
                required
              />
              {errors.companyName && (
                <p className="text-error text-xs mt-1">{errors.companyName}</p>
              )}
            </div>
            <div>
              <label className="label">Initial Subscription (Days)</label>
              <input
                type="number"
                name="subscriptionDays"
                value={formData.subscriptionDays}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.subscriptionDays ? "input-error" : ""
                }`}
                required
              />
              {errors.subscriptionDays && (
                <p className="text-error text-xs mt-1">
                  {errors.subscriptionDays}
                </p>
              )}
            </div>

            {/* Admin Fields */}
            <div className="divider md:col-span-2">Admin User Details</div>
            <div>
              <label className="label">Admin Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.name ? "input-error" : ""
                }`}
                required
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="label">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
                required
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="label">Admin Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.employeeId ? "input-error" : ""
                }`}
                required
              />
              {errors.employeeId && (
                <p className="text-error text-xs mt-1">{errors.employeeId}</p>
              )}
            </div>
            <div>
              <label className="label">Admin Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.phoneNumber ? "input-error" : ""
                }`}
                required
              />
              {errors.phoneNumber && (
                <p className="text-error text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="label">Admin Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.age ? "input-error" : ""
                }`}
                required
              />
              {errors.age && (
                <p className="text-error text-xs mt-1">{errors.age}</p>
              )}
            </div>
            <div>
              <label className="label">Admin Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Admin Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.password ? "input-error" : ""
                }`}
                required
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">{errors.password}</p>
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
                "Create Company"
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

export default CreateCompanyModal;
