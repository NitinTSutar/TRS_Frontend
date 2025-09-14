import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useUserStore from "../store/userStore";
import { logoutUser } from "../utils/api";

const Signout = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const { mutate: signout, isPending } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      setUser(null);
      toast.success("Signed out successfully!");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Signout failed");
    },
  });

  const handleSignout = () => {
    signout();
  };

  return (
    <button
      onClick={handleSignout}
      className="btn btn-soft btn-error mx-2"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          Logging out...
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
};

export default Signout;
