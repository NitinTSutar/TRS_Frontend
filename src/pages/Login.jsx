import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/userStore";
import { loginUser, getProfile } from "../utils/api";

const Login = ({ master }) => {
  const [email, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // First login
      await loginUser({ email, password }, master);
      // Then get profile
      const profileData = await getProfile(master);
      return profileData;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log("Successily");
      navigate("/dashboard");
    },
    onError: (err) => {
      console.log("Login error:", err);
      setError(
        err?.response?.data?.error.message || "Login failed. Please try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    mutate();
  };

  return (
    <>
      <div className="self-center">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend">
              {master ? "Master Admin Login" : "Login"}
            </legend>

            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmailId(e.target.value)}
              className="input"
              placeholder="Email"
              required
            />

            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Password"
              required
            />

            {error && <div className="text-error text-sm mt-2">{error}</div>}

            <button
              type="submit"
              className="btn btn-neutral mt-4 w-full"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Login"
              )}
            </button>
          </fieldset>
        </form>
        {!master && (
          <label className="fieldset-legend align-middle">
            <Link to="/signup"> Don't have an Account? Signup</Link>
          </label>
        )}
      </div>
      <button className="absolute top-[80%] left-[5%] btn btn-ghost">
        {master ? (
          <Link to="/login">User Login</Link>
        ) : (
          <Link to="/superadmin007/login">Master Admin Login</Link>
        )}
      </button>
    </>
  );
};

export default Login;
