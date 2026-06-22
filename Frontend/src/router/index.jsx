import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import MainLayout from "../layouts/MainLayout";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfilePage from "../pages/ProfilePage";
import DevicePage from "../pages/DevicePage";
import UserPage from "../pages/UserPage";
import AssignmentPage from "../pages/AssignmentPage";
import ReportPage from "../pages/ReportPage";
import DeviceDetails from "../components/device/DeviceDetails";
import UserAssignmentDetails from "../components/assignment/UserAssignmentDetails";
import AdminAssignmentDetails from "../components/assignment/AdminAssignmentDetails";
import AdminDeviceDetails from "../components/device/AdminDeviceDetails";
import AdminUserDetails from "../components/user/AdminUserDetails";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/assignments/user/:id" element={<UserAssignmentDetails />} />
            <Route path="/dashboard/assignments/admin/:id" element={<AdminAssignmentDetails />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/devices" element={<DevicePage />} />
            <Route path="/devices/user/:id" element={<DeviceDetails />} />
            <Route path="/devices/admin/:id" element={<AdminDeviceDetails />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/users/user/:id" element={<AdminUserDetails />} />
            <Route path="/assignments" element={<AssignmentPage />} />
            <Route path="/assignments/user/:id" element={<UserAssignmentDetails />} />
            <Route path="/assignments/admin/:id" element={<AdminAssignmentDetails />} />
            <Route path="/reports" element={<ReportPage />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}