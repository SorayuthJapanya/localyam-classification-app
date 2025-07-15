import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import toast, { Toaster } from "react-hot-toast";

// context
import ProtectedRoute from "./context/AdminProtect";
import "./App.css";

// Layouts
import MainLayout from "./layouts/MainLayout";
import BlankLayout from "./layouts/BlankLayout";

// components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Main Pages
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin Pages
import AdminHomePage from "./pages/Admin/AdminHomePage";
import ManageSpeciesPage from "./pages/Admin/ManageSpeciesPage";
import ManageAdmin from "./pages/Admin/ManageAdminPage";
import HistoryAdminPage from "./pages/Admin/HistoryAdminPage";
import ViewProfileUserPage from "./pages/Admin/ViewProfileUserPage";
import EditUserPage from "./pages/Admin/EditUserPage";

// Auth Pages
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import ProfilePage from "./pages/auth/ProfilePage";
import EditProfilePage from "./pages/auth/EditProfilePage";

// Classification Pages
import ClassificationPage from "./pages/Classification/ClassificationPage";
import PreviewPage from "./pages/Classification/PreviewPage";
import HistoryPage from "./pages/HistoryPage";

// Species Pages
import SpeciesPage from "./pages/Spicies/SpeciesPage";
import AddSpeciePage from "./pages/Spicies/AddSpeciePage";
import EditSpeciesPage from "./pages/Spicies/EditSpeciesPage";
import ViewInfoSpeciePage from "./pages/Spicies/ViewInfoSpeciePage";

// Report Page
import PreviewReportPage from "./pages/report/PreviewReportPage";

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        localStorage.setItem("userRole", res.data.role);
        return res.data;
      } catch (error) {
        if (error.response && error.response.status === 401) return null;
        toast.error(error.response.data.message || "Something went wrong");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-gray-50 flex flex-col relation">
        <Routes>
          {/* Main Layouts */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            {/* Classification */}
            <Route
              path="/classification"
              element={
                authUser ? <ClassificationPage /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/history"
              element={authUser ? <HistoryPage /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/preview"
              element={authUser ? <PreviewPage /> : <Navigate to={"/login"} />}
            />

            {/* Species */}
            <Route path="/species" element={<SpeciesPage />} />
            <Route path="/specie/:id" element={<ViewInfoSpeciePage />} />
            <Route
              path="/admin/add-species"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <AddSpeciePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-species/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <EditSpeciesPage />
                </ProtectedRoute>
              }
            />

            {/* Authen */}
            <Route
              path="/login"
              element={
                authUser ? (
                  authUser.role === "ADMIN" ? (
                    <Navigate to="/admin" />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/edit-profile/:id" element={<EditProfilePage />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <AdminHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <ManageAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-species"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <ManageSpeciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/history"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <HistoryAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile-user/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <ViewProfileUserPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-user/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} authUser={authUser}>
                  <EditUserPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Blank layout */}
          <Route element={<BlankLayout />}>
            {/* Report route */}
            <Route path="/preview-report" element={<PreviewReportPage />} />
          </Route>

          {/* NotFoundPage */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
};

export default App;
