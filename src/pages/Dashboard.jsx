import React from "react";
import useUserStore from "../store/userStore"

const Dashboard = () => {
  const {user} = useUserStore();
  return <div>{user.role}</div>;
};

export default Dashboard;
