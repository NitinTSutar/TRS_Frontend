import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "../utils/api";
import useUserStore from "../store/userStore";
import { toast } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyId: "",
    employeeId: "",
    phoneNumber: "",
    role: "employee", // default role
    age: "",
    gender: "male", // default gender
    managerId: "", // only for employees
  });

  const { mutate: signup, isPending } = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      setUser(data.user); // This now correctly logs the user in
      toast.success("Signup successful!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Signup failed");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="self-center">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-2xl border p-4 mb-4">
          <legend className="fieldset-legend">
            Sign-Up {formData.role === "employee" ? "Employee" : "Manager"}
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                className="input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Company ID</label>
              <input
                type="text"
                name="companyId"
                className="input"
                placeholder="Company ID"
                value={formData.companyId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                className="input"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className="input"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Age</label>
              <input
                type="number"
                name="age"
                className="input"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Gender</label>
              <select
                name="gender"
                className="select w-full"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Role</label>
              <select
                name="role"
                className="select w-full"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {formData.role === "employee" && (
              <div>
                <label className="label">Manager ID</label>
                <input
                  type="text"
                  name="managerId"
                  className="input"
                  placeholder="Manager ID"
                  value={formData.managerId}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-neutral mt-4 w-full"
            disabled={isPending}
          >
            {isPending ? "Signing up..." : "Signup"}
          </button>
        </fieldset>
      </form>
      <label className="fieldset-legend">
        <Link to="/login"> Already have an Account? Login</Link>
      </label>
    </div>
  );
};

export default Signup;
