import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateCompanyDetails } from "../../utils/api";

const EditCompanyModal = ({ companyDetails, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhoneNumber: "",
    adminAge: "",
    adminGender: "male",
  });

  useEffect(() => {
    if (companyDetails) {
      const adminUser = companyDetails.users.find((u) => u.role === "admin");
      setFormData({
        companyName: companyDetails.companyName || "",
        adminName: adminUser?.name || "",
        adminEmail: adminUser?.email || "",
        adminPhoneNumber: adminUser?.phoneNumber || "",
        adminAge: adminUser?.age || "",
        adminGender: adminUser?.gender || "male",
        adminPassword: "", // Always starts empty for security
      });
    }
  }, [companyDetails]);

  const { mutate: updateCompany, isPending } = useMutation({
    mutationFn: (updateData) =>
      updateCompanyDetails({
        companyId: companyDetails.companyId,
        updateData,
      }),
    onSuccess: () => {
      toast.success("Company details updated successfully!");
      // Invalidate queries to refetch data
      queryClient.invalidateQueries([
        "companyDetails",
        companyDetails.companyId,
      ]);
      queryClient.invalidateQueries(["companies"]);
      queryClient.invalidateQueries(["masterDashboard"]);
      onClose(); // Close the modal
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to update details."
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty fields so we only send what's changed
    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== "")
    );
    if (Object.keys(updateData).length === 0) {
      toast.error("Please fill at least one field to update.");
      return;
    }
    updateCompany(updateData);
  };

  return (
    <dialog id="edit_company_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg">
          Edit Company: {companyDetails.companyName}
        </h3>

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
                className="input input-bordered w-full"
              />
            </div>

            {/* Admin Fields */}
            <div className="divider md:col-span-2">Admin Details</div>
            <div>
              <label className="label">Admin Name</label>
              <input
                type="text"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Admin Phone Number</label>
              <input
                type="tel"
                name="adminPhoneNumber"
                value={formData.adminPhoneNumber}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Admin Age</label>
              <input
                type="number"
                name="adminAge"
                value={formData.adminAge}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Admin Gender</label>
              <select
                name="adminGender"
                value={formData.adminGender}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">New Admin Password</label>
              <input
                type="password"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Leave blank to keep unchanged"
              />
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
      {/* Clicking outside closes the modal */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default EditCompanyModal;
