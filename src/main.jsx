import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Signup from "./pages/Signup.jsx";
import Settings from "./pages/Settings.jsx";
import Companies from "./pages/Companies.jsx";
import CompanyDetails from "./pages/CompanyDetails.jsx";
import AllTravelRequests from "./components/adminComponents/AllTravelRequests.jsx";
import ManageUsers from "./components/adminComponents/ManageUsers.jsx";
import ManagerRequests from "./components/managerComponents/ManagerRequests.jsx";
import ManagerTeam from "./components/managerComponents/ManagerTeam.jsx";
import CreateRequest from "./components/employeeComponents/CreateRequest.jsx";
import MyRequests from "./components/employeeComponents/MyRequests.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="/login" element={<Login master={false} />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/superadmin007/login"
              element={<Login master={true} />}
            />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companyId" element={<CompanyDetails />} />
            <Route path="/travel-requests" element={<AllTravelRequests />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/team-requests" element={<ManagerRequests />} />
            <Route path="/my-team" element={<ManagerTeam />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/my-requests" element={<MyRequests />} />

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
